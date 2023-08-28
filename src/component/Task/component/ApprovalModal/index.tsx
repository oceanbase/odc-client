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

import { approveTask, rejectTask, updatePartitionPlan } from '@/common/network/task';
import { IConnectionPartitionPlan, TaskStatus, TaskType } from '@/d.ts';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import { Form, Input, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import styles from '../../index.less';

const { TextArea } = Input;

interface IProps {
  taskStore?: TaskStore;
  type: TaskType;
  id: number;
  visible: boolean;
  status?: TaskStatus;
  approvalStatus: boolean;
  partitionPlan?: IConnectionPartitionPlan;
  onCancel: () => void;
  onReload: () => void;
}

const ApprovalModal: React.FC<IProps> = inject('taskStore')(
  observer((props) => {
    const { taskStore, type, id, visible, status, approvalStatus, partitionPlan, onCancel } = props;
    const formRef = useRef(null);

    const handleApprove = async (value: string) => {
      let res = null;
      if (type === TaskType.PARTITION_PLAN && status === TaskStatus.WAIT_FOR_CONFIRM) {
        res = await updatePartitionPlan(id, partitionPlan);
      } else {
        res = await approveTask(props.id, value);
      }
      props?.onReload();
      onCancel();
      if (res) {
        taskStore.getTaskMetaInfo();
        message.success(
          formatMessage({
            id: 'odc.TaskManagePage.component.ApprovalModal.Successful',
          }), //通过成功
        );
      }
    };
    const handleReject = async (value: string) => {
      const res = await rejectTask(props.id, value);
      onCancel();
      if (res) {
        taskStore.getTaskMetaInfo();
        props?.onReload();
        message.success(
          formatMessage({
            id: 'odc.TaskManagePage.component.ApprovalModal.Rejected',
          }), //拒绝成功
        );
      }
    };

    const handleCancel = () => {
      onCancel();
    };

    const onSubmit = () => {
      formRef.current
        .validateFields()
        .then((values) => {
          const { comment } = values;
          if (approvalStatus) {
            handleApprove(comment);
          } else {
            handleReject(comment);
          }
        })
        .catch((error) => {
          console.error(JSON.stringify(error));
        });
    };

    useEffect(() => {
      if (!visible) {
        formRef.current?.resetFields();
      }
    }, [visible]);

    return (
      <Modal
        title={formatMessage({
          id: 'odc.TaskManagePage.component.ApprovalModal.HandlingComments',
        })} /*处理意见*/
        wrapClassName={styles.approvalModal}
        visible={visible}
        onOk={onSubmit}
        onCancel={handleCancel}
        zIndex={1001}
      >
        <Space direction="vertical" size={20} className={styles.block}>
          <Space>
            <span>
              {
                formatMessage({
                  id: 'odc.TaskManagePage.component.ApprovalModal.ProcessingStatus',
                }) /*处理状态:*/
              }
            </span>
            <span>
              {
                approvalStatus
                  ? formatMessage({
                      id: 'odc.TaskManagePage.component.ApprovalModal.Pass',
                    }) //通过
                  : formatMessage({
                      id: 'odc.TaskManagePage.component.ApprovalModal.Reject',
                    }) //拒绝
              }
            </span>
          </Space>
          <Form ref={formRef} requiredMark={false} layout="vertical">
            <Form.Item
              label={formatMessage({
                id: 'odc.TaskManagePage.component.ApprovalModal.HandlingComments',
              })}
              /*处理意见*/ name="comment"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.TaskManagePage.component.ApprovalModal.PleaseEnterAHandlingOpinion',
                  }), //请输入处理意见!
                },
              ]}
            >
              <TextArea
                rows={5}
                placeholder={formatMessage({
                  id: 'odc.TaskManagePage.component.ApprovalModal.PleaseEnterHandlingCommentsWithin',
                })} /*请输入处理意见，200字以内*/
              />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    );
  }),
);

export default ApprovalModal;
