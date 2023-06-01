import { nodeStatus } from '@/component/Task/component/Status';
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
