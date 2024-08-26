/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IConnectionStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import Icon, { Loading3QuartersOutlined, MinusCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { IDatabase } from '@/d.ts/database';
import datasourceStatus from '@/store/datasourceStatus';
import { observer } from 'mobx-react';
import LogicIcon from '../logicIcon';
import { isLogicalDatabase } from '@/util/database';

export default observer(function DataBaseStatusIcon({ item }: { item: IDatabase }) {
  const datasource = item.dataSource;
  const statusInfo = datasourceStatus.statusMap.get(datasource?.id) || datasource?.status;
  let status = isLogicalDatabase(item) ? IConnectionStatus.ACTIVE : statusInfo?.status;
  const icon = getDataSourceStyleByConnectType(datasource?.type || item?.connectType)?.dbIcon;
  switch (status) {
    case IConnectionStatus.TESTING: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.StatusSynchronizationInProgress',
            defaultMessage: '状态同步中',
          })}
        >
          <Loading3QuartersOutlined
            spin
            style={{
              color: '#1890FF',
            }}
          />
        </Tooltip>
      );
    }
    case IConnectionStatus.ACTIVE: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.ValidConnection',
            defaultMessage: '有效连接',
          })}
        >
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <Icon component={icon?.component} style={{ fontSize: 16, paddingRight: 4 }} />
            {isLogicalDatabase(item) && <LogicIcon />}
          </div>
        </Tooltip>
      );
    }
    case IConnectionStatus.NOPASSWORD: {
      return (
        <Tooltip
          placement="top"
          title={
            formatMessage({
              id: 'odc.components.ConnectionCardList.TheConnectionPasswordIsNot',
              defaultMessage: '连接密码未保存，无法获取状态',
            })

            // 连接密码未保存，无法获取状态
          }
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.DISABLED: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.page.ConnectionList.columns.TheConnectionIsDisabled',
            defaultMessage: '连接已停用',
          })}

          /* 连接已停用 */
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.INACTIVE:
    default: {
      return (
        <Tooltip title={statusInfo?.errorMessage} placement="top">
          <Icon component={icon?.component} style={{ fontSize: 16, filter: 'grayscale(1)' }} />
        </Tooltip>
      );
    }
  }
});
