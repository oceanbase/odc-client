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

import UserPopover from '@/component/UserPopover';
import { ITaskFlowNode, ITaskResult, TaskFlowNodeType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Descriptions, Space } from 'antd';
import { isEmpty } from 'lodash';
import React from 'react';
import { DownloadFileAction } from '@/component/Task/component/DownloadFileAction';
import styles from '../index.less';
import { nodeStatus as nodeStatusMap } from '@/component/Task/component/Status';
interface IProps {
  taskId: number;
  node: Partial<ITaskFlowNode>;
  result: ITaskResult;
}

const RollbackNode: React.FC<IProps> = function (props) {
  const { taskId, node, result } = props;
  const { operator, autoApprove } = node;
  const statusContent = nodeStatusMap[TaskFlowNodeType.SERVICE_TASK][node?.status];

  return (
    <>
      <Descriptions column={1} className={styles.block}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.CommonDetailModal.Nodes.RollbackNode.Handler',
            defaultMessage: '处理人',
          })} /*处理人*/
        >
          <Space>
            <UserPopover
              name={operator?.name}
              accountName={operator?.accountName}
              roles={operator?.roleNames}
            />

            {autoApprove && (
              <span className={styles.description}>
                {
                  formatMessage({
                    id: 'odc.CommonDetailModal.Nodes.RollbackNode.AutomaticApproval',
                    defaultMessage: '(自动审批)',
                  }) /*(自动审批)*/
                }
              </span>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.CommonDetailModal.Nodes.RollbackNode.ProcessingStatus',
            defaultMessage: '处理状态',
          })} /*处理状态*/
        >
          {statusContent?.text ?? '-'}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default RollbackNode;
