import { formatMessage } from '@/util/intl';
import { TaskPartitionStrategy, TaskErrorStrategy } from '@/d.ts';

export const ErrorStrategyMap = {
  [TaskErrorStrategy.ABORT]: formatMessage({ id: 'src.component.Task.F0079010' }), //'停止任务'
  [TaskErrorStrategy.CONTINUE]: formatMessage({ id: 'src.component.Task.2DA054B9' }), //'忽略错误继续任务'
};

export const TaskPartitionStrategyMap = {
  [TaskPartitionStrategy.CREATE]: formatMessage({ id: 'src.component.Task.CD347F96' }), //'创建策略'
  [TaskPartitionStrategy.DROP]: formatMessage({ id: 'src.component.Task.9262EB40' }), //'删除策略'
};
