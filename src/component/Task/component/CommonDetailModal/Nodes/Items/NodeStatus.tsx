import { ITaskFlowNode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
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
      {externalFlowInstanceUrl && (
        <a href={externalFlowInstanceUrl} target="_blank" rel="noreferrer">
          {
            formatMessage({
              id: 'odc.component.CommonTaskDetailModal.TaskFlow.ViewApprovalDetails',
            }) /*查看审批详情*/
          }
        </a>
      )}
    </Space>
  );
};

export default NodeStatus;