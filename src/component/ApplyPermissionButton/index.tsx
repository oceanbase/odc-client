import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Space } from 'antd';
import type { ButtonProps } from 'antd/lib/button';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

interface IProps extends ButtonProps {
  showArrow?: boolean;
  modalStore?: ModalStore;
}

const ApplyPermissionButton: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, showArrow, ...rest } = props;

    const handleApplyPermission = () => {
      modalStore.changeApplyPermissionModal(true);
    };

    return (
      <Button {...rest} onClick={handleApplyPermission} className={styles.apply}>
        <Space size={4}>
          {
            formatMessage({
              id: 'odc.component.ApplyPermissionButton.ApplyForConnectionPermissions',
            }) /*申请连接权限*/
          }

          {showArrow && <>&gt;</>}
        </Space>
      </Button>
    );
  }),
);

export default ApplyPermissionButton;
