import { getTaskDetail } from '@/common/network/task';
import { TaskOperationType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Drawer, Space, Spin } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import TaskFlow from './TaskFlow';
import { operationTypeMap } from './TaskOperationRecord';

interface IProps {
  id: number;
  operationType: TaskOperationType;
  visible: boolean;
  onClose: () => void;
}

const FlowModal: React.FC<IProps> = inject('schemaStore')(
  observer(function (props) {
    const { visible, id, operationType, onClose } = props;
    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState(null);

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

    return (
      <Drawer
        visible={visible}
        width={520}
        onClose={onClose}
        title={formatMessage({
          id: 'odc.component.CommonTaskDetailModal.FlowModal.ApprovalRecord',
        })} /*审批记录*/
        destroyOnClose
        className={styles.detailDrawer}
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
      </Drawer>
    );
  }),
);

export default FlowModal;
