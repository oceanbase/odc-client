import { TaskPartitionStrategy, TaskErrorStrategy } from '@/d.ts';

export const ErrorStrategyMap = {
  [TaskErrorStrategy.ABORT]: '停止任务',
  [TaskErrorStrategy.CONTINUE]: '忽略错误继续任务',
};

export const TaskPartitionStrategyMap = {
  [TaskPartitionStrategy.CREATE]: '创建策略',
  [TaskPartitionStrategy.DROP]: '删除策略',
};
