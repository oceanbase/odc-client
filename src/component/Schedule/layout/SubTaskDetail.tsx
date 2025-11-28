import React, { useEffect, useRef, useState } from 'react';
import { detailScheduleTask, getScheduleDetail } from '@/common/network/schedule';
import {
  IScheduleRecord,
  ScheduleRecordParameters,
  IPartitionPlan,
  ScheduleType,
  ISqlPlanParameters,
  IDataArchiveParameters,
  IDataClearParameters,
} from '@/d.ts/schedule';
import {
  IDataArchiveParametersSubTaskParameters,
  IDataArchiveSubTaskExecutionDetails,
  IDataClearParametersSubTaskParameters,
  IDataDeleteSubTaskExecutionDetails,
  IPartitionPlanSubTaskExecutionDetails,
  IPartitionPlanSubTaskParameters,
  IScheduleTaskExecutionDetail,
  IScheduleTaskRecord,
  ISqlPlanParametersSubTaskParameters,
  ISqlPlanSubTaskExecutionDetails,
  scheduleTask,
  ScheduleTaskStatus,
  SubTaskParameters,
} from '@/d.ts/scheduleTask';
import { ScheduleTaskDetailType, SubTaskType } from '@/d.ts/scheduleTask';
import type { ILog } from '@/component/Task/component/Log';
import { ITaskResult, Operation, CommonTaskLogType } from '@/d.ts';
import SubTaskDetailModal from '../components/SubTaskDetailModal';
import { getScheduleTaskLog } from '@/common/network/schedule';
import {
  DataClearScheduleContent,
  PartitionScheduleContent,
  DataArchiveScheduleContent,
  SQLPlanScheduleContent,
} from '../modals/Detail';
import { useLoop } from '@/util/hooks/useLoop';

/**
 * 需要实时更新的状态
 */
const loopStatus = [
  ScheduleTaskStatus.PREPARING,
  ScheduleTaskStatus.RUNNING,
  ScheduleTaskStatus.ABNORMAL,
  ScheduleTaskStatus.PAUSING,
  ScheduleTaskStatus.PAUSED,
  ScheduleTaskStatus.RESUMING,
  ScheduleTaskStatus.CANCELING,
];

interface IProps {
  visible: boolean;
  detailId: number;
  onClose: () => void;
  scheduleId: number;
  detailTabType?: ScheduleTaskDetailType;
  onReloadList?: () => void;
}

const SubTaskDetail: React.FC<IProps> = (props) => {
  const {
    visible,
    onClose,
    detailId,
    scheduleId,
    detailTabType = ScheduleTaskDetailType.INFO,
    onReloadList,
  } = props;
  const [subTask, setSubTask] =
    useState<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>>(null);
  const [detailType, setDetailType] = useState<ScheduleTaskDetailType>(detailTabType);
  const [log, setLog] = useState<ILog>(null);
  const [result, setResult] = useState<ITaskResult>(null);
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [opRecord, setOpRecord] = useState<Operation[]>(null);
  const [schedule, setSchedule] = useState<IScheduleRecord<ScheduleRecordParameters>>(null);
  let taskContent = null;

  const { loop: loadData, destory } = useLoop((count) => {
    return async () => {
      if (subTask?.status && loopStatus?.includes(subTask?.status)) {
        setLoading(false);
        destory();
        return;
      }
      const res = await detailScheduleTask(scheduleId, detailId);
      setLoading(false);
      setSubTask(res);
    };
  }, 6500);

  const getLog = async () => {
    const data = await getScheduleTaskLog(schedule?.scheduleId, detailId, logType);
    setLoading(false);
    setLog({
      ...log,
      [logType]: data,
    });
  };

  const loadTaskData = async () => {
    switch (detailType) {
      case ScheduleTaskDetailType.INFO:
      case ScheduleTaskDetailType.EXECUTE_RESULT: {
        if (!subTask) {
          loadData();
        }
        break;
      }
      case ScheduleTaskDetailType.LOG: {
        getLog();
        break;
      }
    }
  };

  const handleLogTypeChange = (type: CommonTaskLogType) => {
    setLogType(type);
  };

  const resetModal = () => {
    setSubTask(null);
    setDetailType(ScheduleTaskDetailType.INFO);
    setLog(null);
    setResult(null);
    setSchedule(null);
    setLoading(false);
    destory();
  };

  const getSchedule = async () => {
    const res = await getScheduleDetail(scheduleId);
    setLoading(false);
    setSchedule(res);
  };

  useEffect(() => {
    if (visible && detailId) {
      loadTaskData();
    } else {
      resetModal();
    }
  }, [detailId, detailType, logType, visible]);

  useEffect(() => {
    if (visible && detailId && !subTask) {
      setLoading(true);
    }
  }, [subTask, visible, detailId]);

  useEffect(() => {
    if (visible && scheduleId) {
      getSchedule();
    }
  }, [scheduleId, visible]);

  switch (subTask?.type) {
    case SubTaskType.SQL_PLAN:
      taskContent = (
        <SQLPlanScheduleContent
          schedule={schedule as IScheduleRecord<ISqlPlanParameters>}
          subTask={
            subTask as scheduleTask<
              ISqlPlanParametersSubTaskParameters,
              ISqlPlanSubTaskExecutionDetails
            >
          }
        />
      );
      break;
    case SubTaskType.PARTITION_PLAN:
      taskContent = (
        <PartitionScheduleContent
          schedule={schedule as IScheduleRecord<IPartitionPlan>}
          subTask={
            subTask as scheduleTask<
              IPartitionPlanSubTaskParameters,
              IPartitionPlanSubTaskExecutionDetails
            >
          }
        />
      );
      break;
    case SubTaskType.DATA_ARCHIVE:
    case SubTaskType.DATA_ARCHIVE_ROLLBACK:
    case SubTaskType.DATA_ARCHIVE_DELETE:
      taskContent = (
        <DataArchiveScheduleContent
          schedule={schedule as IScheduleRecord<IDataArchiveParameters>}
          subTask={
            subTask as scheduleTask<
              IDataArchiveParametersSubTaskParameters,
              IDataArchiveSubTaskExecutionDetails
            >
          }
        />
      );
      break;
    case SubTaskType.DATA_DELETE:
      taskContent = (
        <DataClearScheduleContent
          schedule={schedule as IScheduleRecord<IDataClearParameters>}
          subTask={
            subTask as scheduleTask<
              IDataClearParametersSubTaskParameters,
              IDataDeleteSubTaskExecutionDetails
            >
          }
        />
      );
      break;
  }

  useEffect(() => {
    setDetailType(detailTabType);
  }, [detailTabType]);

  return (
    <SubTaskDetailModal
      log={log}
      loading={loading}
      opRecord={opRecord}
      result={result}
      logType={logType}
      handleLogTypeChange={handleLogTypeChange}
      visible={visible}
      onClose={onClose}
      isLoading={false}
      detailType={detailType}
      taskContent={taskContent}
      onDetailTypeChange={setDetailType}
      enabledAction={true}
      subTask={subTask}
      onReloadList={onReloadList}
    />
  );
};

export default SubTaskDetail;
