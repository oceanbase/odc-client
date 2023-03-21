import { createTask } from '@/common/network/task';
import { TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { openTasksPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Space } from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { FormInstance } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useRef, useState } from 'react';
import PermissionForm, { IPermissionData } from './form';

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  connectionStore?: ConnectionStore;
}

const ApplyPermission: React.FC<IProps> = inject(
  'modalStore',
  'connectionStore',
)(
  observer((props) => {
    const { modalStore } = props;
    const [confirmLoading, setConfirmLoading] = useState(false);

    const formRef = useRef<FormInstance<IPermissionData>>(null);

    const onClose = useCallback(() => {
      modalStore.changeApplyPermissionModal(false, null);
    }, [modalStore]);

    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.ApplyPermission.AreYouSureYouWant',
        }),
        //确认取消权限申请吗？
        centered: true,
        onOk() {
          onClose();
        },
      });
    }, [onClose]);

    const handleSubmit = async () => {
      try {
        const values = await formRef.current.validateFields();
        const params = {
          taskType: TaskType.PERMISSION_APPLY,
          executionStrategy: TaskExecStrategy.AUTO,
          description: values.description,
          parameters: {
            applyInfoList: values.connections?.map((item) => ({
              ...item,
              actions: values.permissionType.split(','),
            })),
          },
        };

        setConfirmLoading(true);
        const resCount = await createTask(params);
        setConfirmLoading(false);
        if (resCount) {
          message.success(
            formatMessage(
              {
                id: 'odc.component.ApplyPermission.PermissionApplicationSubmittedSuccessfullyRescount',
              },
              { resCount: resCount },
            ), //`权限申请提交成功，已生成${resCount}条审批任务`
          );
          onClose();
          openTasksPage(TaskPageType.PERMISSION_APPLY, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Drawer
        visible={modalStore.applyPermissionVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={720}
        title={formatMessage({
          id: 'odc.component.ApplyPermission.ApplyForConnectionPermissions',
        })}
        /*申请连接权限*/
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.component.ApplyPermission.Cancel',
                })
                /*取消*/
              }
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'odc.component.ApplyPermission.Submit',
                })
                /*提交*/
              }
            </Button>
          </Space>
        }
      >
        <PermissionForm ref={formRef} />
      </Drawer>
    );
  }),
);

export default ApplyPermission;
