import { IOperationTypeRole, ScheduleStatus, ScheduleActionsEnum } from '@/d.ts/schedule';
import { ScheduleTaskActionsEnum, ScheduleTaskStatus } from '@/d.ts/scheduleTask';

/** 作业状态对应的操作 */
const ScheduleStatus2Actions: Record<ScheduleStatus, ScheduleActionsEnum[]> = {
  [ScheduleStatus.ENABLED]: [
    ScheduleActionsEnum.STOP,
    ScheduleActionsEnum.DISABLE,
    ScheduleActionsEnum.VIEW,
    ScheduleActionsEnum.CLONE,
    ScheduleActionsEnum.SHARE,
  ],
  [ScheduleStatus.PAUSE]: [
    ScheduleActionsEnum.EDIT,
    ScheduleActionsEnum.ENABLE,
    ScheduleActionsEnum.STOP,
    ScheduleActionsEnum.VIEW,
    ScheduleActionsEnum.CLONE,
    ScheduleActionsEnum.SHARE,
  ],
  [ScheduleStatus.COMPLETED]: [
    ScheduleActionsEnum.DELETE,
    ScheduleActionsEnum.VIEW,
    ScheduleActionsEnum.CLONE,
    ScheduleActionsEnum.SHARE,
  ],
  [ScheduleStatus.TERMINATED]: [
    ScheduleActionsEnum.DELETE,
    ScheduleActionsEnum.VIEW,
    ScheduleActionsEnum.CLONE,
    ScheduleActionsEnum.SHARE,
  ],
  [ScheduleStatus.CREATING]: [
    ScheduleActionsEnum.VIEW,
    ScheduleActionsEnum.CLONE,
    ScheduleActionsEnum.SHARE,
  ],
  /** 删除不可见 */
  [ScheduleStatus.DELETED]: [],
};

/** 作业子任务状态对应的操作 */
const ScheduleTaskStatus2Actions: Record<ScheduleTaskStatus, ScheduleTaskActionsEnum[]> = {
  [ScheduleTaskStatus.PREPARING]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.RUNNING]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.PAUSE,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.ABNORMAL]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.RETRY,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.PAUSING]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.PAUSED]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.RESTORE,
  ],
  [ScheduleTaskStatus.RESUMING]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.CANCELING]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.STOP,
  ],
  [ScheduleTaskStatus.FAILED]: [ScheduleTaskActionsEnum.VIEW, ScheduleTaskActionsEnum.SHARE],
  [ScheduleTaskStatus.EXEC_TIMEOUT]: [ScheduleTaskActionsEnum.VIEW, ScheduleTaskActionsEnum.SHARE],
  [ScheduleTaskStatus.CANCELED]: [ScheduleTaskActionsEnum.VIEW, ScheduleTaskActionsEnum.SHARE],
  [ScheduleTaskStatus.DONE]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.ROLLBACK,
  ],
  [ScheduleTaskStatus.DONE_WITH_FAILED]: [
    ScheduleTaskActionsEnum.VIEW,
    ScheduleTaskActionsEnum.SHARE,
    ScheduleTaskActionsEnum.ROLLBACK,
  ],
};

export { ScheduleStatus2Actions, ScheduleTaskStatus2Actions };
