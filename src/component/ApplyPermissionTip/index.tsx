import { hasSourceReadAuth } from '@/component/Acess';
import { ConnectionStore } from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Tooltip } from 'antd';
import type { ButtonProps } from 'antd/lib/button';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IProps extends ButtonProps {
  connectionStore?: ConnectionStore;
}

const ApplyPermissionTip: React.FC<IProps> = inject('connectionStore')(
  observer((props) => {
    const {
      connectionStore: { connection },
    } = props;
    const isReadonly = hasSourceReadAuth(connection.permittedActions);
    return (
      <Tooltip
        placement="rightTop"
        title={
          isReadonly && (
            <>
              <div>
                {
                  formatMessage({
                    id: 'odc.component.ApplyPermissionTip.InsufficientDatabasePermissions',
                  }) /*当前数据库权限不足*/
                }
              </div>
            </>
          )
        }
      >
        {props.children}
        <span />
      </Tooltip>
    );
  }),
);

export default ApplyPermissionTip;
