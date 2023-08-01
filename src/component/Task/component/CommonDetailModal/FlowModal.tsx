import { getTaskDetail } from '@/common/network/task';
import { TaskOperationType } from '@/d.ts';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Space, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import ApprovalModal from '../ApprovalModal';
import styles from './index.less';
import TaskFlow from './TaskFlow';
import { operationTypeMap } from './TaskOperationRecord';

interface IProps {
  userStore?: UserStore;
  id: number;
  operationType: TaskOperationType;
  visible: boolean;
  onClose: () => void;
}

const FlowModal: React.FC<IProps> = function (props) {
  const {
    userStore: { user },
    visible,
    id,
    operationType,
    onClose,
  } = props;
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
  const isOwner = user?.id === task?.creator?.id;
  const isApprovable = task?.approvable;

  const getTask = async function (id) {
    setLoading(true);
    const data = await getTaskDetail(id);
    setLoading(false);
    setTask(data);
  };

  useEffect(() => {
    if (id) {
      getTask(id);
    }
  }, [id]);

  const handleApprovalVisible = (approvalStatus: boolean = false, visible: boolean = false) => {
    setApprovalVisible(visible);
    setApprovalStatus(approvalStatus);
  };

  return (
    <Drawer
      visible={visible}
      width={520}
      onClose={onClose}
      title={formatMessage({
        id: 'odc.component.CommonTaskDetailModal.FlowModal.ApprovalRecord',
      })} /*审批记录*/
      destroyOnClose
      className={styles.flowDrawer}
      footer={
        isOwner &&
        isApprovable && (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                handleApprovalVisible(true, true);
              }}
            >
              审批
            </Button>
            <Button
              onClick={() => {
                handleApprovalVisible(false, true);
              }}
            >
              拒绝
            </Button>
          </Space>
        )
      }
    >
      <Space>
        <span>
          {
            formatMessage({
              id: 'odc.component.CommonTaskDetailModal.FlowModal.ActionEvents',
            }) /*操作事件：*/
          }
        </span>
        <span>{operationTypeMap?.[operationType]}</span>
      </Space>
      <Spin spinning={loading}>{task && <TaskFlow task={task} />}</Spin>
      <ApprovalModal
        type={task?.type}
        id={task?.id}
        visible={approvalVisible}
        status={task?.status}
        approvalStatus={approvalStatus}
        onReload={() => {}}
        onCancel={() => {
          handleApprovalVisible(false);
        }}
      />
    </Drawer>
  );
};

export default inject('userStore')(observer(FlowModal));
