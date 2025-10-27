import { ScheduleTaskStatus, ScheduleTaskActionsEnum, SubTaskType } from '@/d.ts/scheduleTask';
import { formatMessage } from '@/util/intl';

export const ScheduleTaskStatusTextMap = {
  [ScheduleTaskStatus.PREPARING]: formatMessage({
    id: 'src.constant.34E5C97B',
    defaultMessage: '待调度',
  }),
  [ScheduleTaskStatus.RUNNING]: formatMessage({
    id: 'src.constant.F9FC661D',
    defaultMessage: '执行中',
  }),
  [ScheduleTaskStatus.ABNORMAL]: formatMessage({
    id: 'src.constant.0266A8BF',
    defaultMessage: '执行异常',
  }),
  [ScheduleTaskStatus.PAUSING]: formatMessage({
    id: 'src.constant.76A69AE6',
    defaultMessage: '暂停中',
  }),
  [ScheduleTaskStatus.PAUSED]: formatMessage({
    id: 'src.constant.D2655A3F',
    defaultMessage: '已暂停',
  }),
  [ScheduleTaskStatus.RESUMING]: formatMessage({
    id: 'src.constant.374B0A5E',
    defaultMessage: '恢复中',
  }),
  [ScheduleTaskStatus.CANCELING]: formatMessage({
    id: 'src.constant.E33F185E',
    defaultMessage: '终止中',
  }),
  [ScheduleTaskStatus.FAILED]: formatMessage({
    id: 'src.constant.FBE3BF77',
    defaultMessage: '执行失败',
  }),
  [ScheduleTaskStatus.EXEC_TIMEOUT]: formatMessage({
    id: 'src.constant.070232E5',
    defaultMessage: '执行超时',
  }),
  [ScheduleTaskStatus.CANCELED]: formatMessage({
    id: 'src.constant.E259C8F6',
    defaultMessage: '已终止',
  }),
  [ScheduleTaskStatus.DONE]: formatMessage({
    id: 'src.constant.94D43E28',
    defaultMessage: '执行成功',
  }),
  [ScheduleTaskStatus.DONE_WITH_FAILED]: formatMessage({
    id: 'src.constant.38990D9A',
    defaultMessage: '执行成功',
  }),
};

export const ScheduleTaskActionsTextMap = {
  [ScheduleTaskActionsEnum.VIEW]: formatMessage({
    id: 'src.constant.E9F9A982',
    defaultMessage: '查看',
  }),
  [ScheduleTaskActionsEnum.SHARE]: formatMessage({
    id: 'src.constant.1D85ED39',
    defaultMessage: '分享',
  }),
  [ScheduleTaskActionsEnum.STOP]: formatMessage({
    id: 'src.constant.D0C9DE28',
    defaultMessage: '终止',
  }),
  [ScheduleTaskActionsEnum.EXECUTE]: formatMessage({
    id: 'src.constant.E29F545F',
    defaultMessage: '执行',
  }),
  [ScheduleTaskActionsEnum.PAUSE]: formatMessage({
    id: 'src.constant.74E92FD7',
    defaultMessage: '暂停',
  }),
  [ScheduleTaskActionsEnum.RESTORE]: formatMessage({
    id: 'src.constant.08E8B8B4',
    defaultMessage: '恢复',
  }),
  [ScheduleTaskActionsEnum.RETRY]: formatMessage({
    id: 'src.constant.DDE25811',
    defaultMessage: '重试',
  }),
  [ScheduleTaskActionsEnum.ROLLBACK]: formatMessage({
    id: 'src.constant.44D5E598',
    defaultMessage: '回滚',
  }),
};

export const SubTypeTextMap = {
  [SubTaskType.DATA_ARCHIVE]: formatMessage({
    id: 'odc.component.CommonDetailModal.TaskExecuteRecord.DataArchiving',
    defaultMessage: '数据归档',
  }),
  [SubTaskType.PARTITION_PLAN]: formatMessage({
    id: 'src.constant.8D1B01C9',
    defaultMessage: '分区计划',
  }),
  [SubTaskType.SQL_PLAN]: formatMessage({
    id: 'src.constant.B8946B23',
    defaultMessage: 'SQL 计划',
  }),
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
