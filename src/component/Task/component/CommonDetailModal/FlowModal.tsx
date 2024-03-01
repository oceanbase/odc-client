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

import { getTaskDetail } from '@/common/network/task';
import { TaskOperationType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import ApprovalModal from '../ApprovalModal';
import styles from './index.less';
import TaskFlow from './TaskFlow';
import { operationTypeMap } from './TaskOperationRecord';
interface IProps {
  id: number;
  operationType: TaskOperationType;
  visible: boolean;
  onClose: () => void;
}
const FlowModal: React.FC<IProps> = function (props) {
  const { visible, id, operationType, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(false);
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
      open={visible}
      width={520}
      onClose={onClose}
      title={formatMessage({
        id: 'odc.component.CommonTaskDetailModal.FlowModal.ApprovalRecord',
      })}
      /*审批记录*/ destroyOnClose
      className={styles.flowDrawer}
      footer={
        task?.approvable && (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                handleApprovalVisible(true, true);
              }}
            >
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.CommonDetailModal.Pass',
                }) /* 
              通过
             */
              }
            </Button>
            <Button
              onClick={() => {
                handleApprovalVisible(false, true);
              }}
            >
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.CommonDetailModal.Reject',
                }) /* 
              拒绝
             */
              }
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
        id={task?.id}
        visible={approvalVisible}
        approvalStatus={approvalStatus}
        onReload={() => {
          getTask(id);
        }}
        onCancel={() => {
          handleApprovalVisible(false);
        }}
      />
    </Drawer>
  );
};
export default FlowModal;
