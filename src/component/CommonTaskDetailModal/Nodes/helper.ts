import { nodeStatus } from '@/component/TaskStatus';
import { TaskFlowNodeType, TaskNodeStatus } from '@/d.ts';

export function getStatusDisplayInfo(
  nodeType: TaskFlowNodeType,
  status: TaskNodeStatus,
): {
  text: string;
  status?: string;
} {
  return nodeStatus[nodeType][status];
}
