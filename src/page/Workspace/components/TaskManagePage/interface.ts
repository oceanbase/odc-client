import type { ILog } from '@/component/TaskLog';
import type {
  CommonTaskLogType,
  IAsyncTaskParams,
  ITaskResult,
  TaskDetail,
  TaskRecord,
  TaskRecordParameters,
} from '@/d.ts';
export interface ITaskDetailModalProps {
  visible: boolean;
  taskTools: React.ReactNode;
  isLoading: boolean;
  detailType: TaskDetailType;
  task: TaskDetail<TaskRecordParameters>;
  subTasks: TaskRecord<IAsyncTaskParams>[];
  opRecord: TaskRecord<any>[];
  hasFlow: boolean;
  result: ITaskResult;
  log: ILog;
  logType: CommonTaskLogType;
  onDetailTypeChange: (type: TaskDetailType) => void;
  onLogTypeChange: (type: CommonTaskLogType) => void;
  onClose: () => void;
  onReload: () => void;
}

export enum TaskDetailType {
  INFO = 'info',
  FLOW = 'flow',
  RESULT = 'result',
  LOG = 'log',
  RECORD = 'record',
  EXECUTE_RECORD = 'execute_record',
  OPERATION_RECORD = 'operation_record',
}
