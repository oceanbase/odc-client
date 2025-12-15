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

import { ITaskFlowNode, TaskNodeStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { LoadingOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';
import { getStatusDisplayInfo } from '../helper';

interface IProps {
  node: Partial<ITaskFlowNode>;
}

const NodeStatus: React.FC<IProps> = function ({ node }) {
  const { status, externalFlowInstanceUrl, nodeType } = node;
  const statusContent = getStatusDisplayInfo(nodeType, status);
  return (
    <Space>
      {statusContent?.text}
      {status === TaskNodeStatus.EXECUTING && <LoadingOutlined />}
      {externalFlowInstanceUrl && (
        <a href={externalFlowInstanceUrl} target="_blank" rel="noreferrer">
          {
            formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.ViewApprovalDetails',
              defaultMessage: '查看审批详情',
            }) /*查看审批详情*/
          }
        </a>
      )}
    </Space>
  );
};

export default NodeStatus;
