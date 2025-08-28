import { useState } from 'react';
import type { AsyncTaskType, ISwitchOdcTaskListResponse } from '@/d.ts/migrateTask';
import { UnfinishedScheduleListType } from '@/d.ts/migrateTask';
import { TaskRecord, TaskRecordParameters, TaskStatus } from '@/d.ts';
import { IScheduleRecord, ScheduleRecordParameters, ScheduleStatus } from '@/d.ts/schedule';

export interface AsyncTaskModalConfig {
  asyncTaskType: AsyncTaskType;
  columns: any[];
  dataSource: TaskRecord<TaskRecordParameters>[];

  confirmButtonText: string;
  confirmButtonType?: 'primary' | 'default' | 'danger';

  needRiskConfirm?: boolean;
  needSelectSpace?: boolean;

  modalTitle: string;
  modalExtra: (count: number, ids?: number[]) => React.ReactNode;

  checkStatus: (
    task: TaskRecord<TaskRecordParameters> | IScheduleRecord<ScheduleRecordParameters>,
  ) => boolean;
  checkStatusFailed: string;

  onReload: () => void;
}

export function useAsyncTaskTable() {
  const [visible, setVisible] = useState(false);
  const [riskConfirmed, setRiskConfirmed] = useState(false);
  const [confirmRiskUnFinished, setConfirmRiskUnFinished] = useState(false);
  const [exportSpaceScopes, setExportSpaceScopes] = useState<string[]>([
    UnfinishedScheduleListType.TEAM,
    UnfinishedScheduleListType.INDIVIDUAL,
  ]);

  const showModal = () => {
    setVisible(true);
    setExportSpaceScopes([UnfinishedScheduleListType.TEAM, UnfinishedScheduleListType.INDIVIDUAL]);
  };

  const hideModal = () => {
    setVisible(false);
    setRiskConfirmed(false);
  };

  const handleExportSpaceScopesChange = (checkedValues: string[]) => {
    setExportSpaceScopes(checkedValues);
  };

  return {
    visible,
    setVisible,
    riskConfirmed,
    setRiskConfirmed,
    confirmRiskUnFinished,
    setConfirmRiskUnFinished,
    showModal,
    hideModal,
    exportSpaceScopes,
    handleExportSpaceScopesChange,
  };
}

export default useAsyncTaskTable;
