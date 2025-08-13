import { ScheduleTaskStatus, ScheduleTaskActionsEnum, SubTaskType } from '@/d.ts/scheduleTask';
import { formatMessage } from '@/util/intl';

export const ScheduleTaskStatusTextMap = {
  [ScheduleTaskStatus.PREPARING]: '待调度',
  [ScheduleTaskStatus.RUNNING]: '执行中',
  [ScheduleTaskStatus.ABNORMAL]: '执行异常',
  [ScheduleTaskStatus.PAUSING]: '暂停中',
  [ScheduleTaskStatus.PAUSED]: '已暂停',
  [ScheduleTaskStatus.RESUMING]: '恢复中',
  [ScheduleTaskStatus.CANCELING]: '终止中',
  [ScheduleTaskStatus.FAILED]: '执行失败',
  [ScheduleTaskStatus.EXEC_TIMEOUT]: '执行超时',
  [ScheduleTaskStatus.CANCELED]: '已终止',
  [ScheduleTaskStatus.DONE]: '执行成功',
};

export const ScheduleTaskActionsTextMap = {
  [ScheduleTaskActionsEnum.VIEW]: '查看',
  [ScheduleTaskActionsEnum.SHARE]: '分享',
  [ScheduleTaskActionsEnum.STOP]: '终止',
  [ScheduleTaskActionsEnum.EXECUTE]: '执行',
  [ScheduleTaskActionsEnum.PAUSE]: '暂停',
  [ScheduleTaskActionsEnum.RESTORE]: '恢复',
  [ScheduleTaskActionsEnum.RETRY]: '重试',
};

export const SubTypeTextMap = {
  [SubTaskType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataArchiving',
    defaultMessage: '数据归档',
  }),
  [SubTaskType.PARTITION_PLAN]: '分区计划',
  [SubTaskType.SQL_PLAN]: '数据库变更',
  [SubTaskType.DATA_DELETE]: formatMessage({
    id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataCleansing',
    defaultMessage: '数据清理',
  }), //数据清理
  [SubTaskType.DATA_ARCHIVE_ROLLBACK]: formatMessage({
    id: 'odc.component.CommonDetailModal.TaskExecuteRecord.Rollback',
    defaultMessage: '回滚',
  }),
  [SubTaskType.DATA_ARCHIVE_DELETE]: formatMessage({
    id: 'odc.component.CommonDetailModal.TaskExecuteRecord.SourceTableCleanup',
    defaultMessage: '源表清理',
  }),
};
