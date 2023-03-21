import { ITaskFlowNode } from '@/d.ts';
import { getLocalFormatDateTime } from '@/util/utils';
import React from 'react';

interface IProps {
  node: Partial<ITaskFlowNode>;
}

const NodeCompleteTime: React.FC<IProps> = function ({ node }) {
  const { completeTime } = node;
  return <span>{getLocalFormatDateTime(completeTime)}</span>;
};

export default NodeCompleteTime;
