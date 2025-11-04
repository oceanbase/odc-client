import { getScheduleDetail } from '@/common/network/schedule';
import type { ITableLoadOptions } from '@/component/CommonTable/interface';
import ScheduleDetailModal from '../components/ScheduleDetailModal';
import React, { useEffect, useState } from 'react';
import {
  DataClearScheduleContent,
  PartitionScheduleContent,
  DataArchiveScheduleContent,
  SQLPlanScheduleContent,
} from '../modals/Detail';
import {
  ScheduleType,
  IScheduleRecord,
  ScheduleRecordParameters,
  IPartitionPlan,
  IDataArchiveParameters,
  ScheduleStatus,
  IDataClearParameters,
  ISqlPlanParameters,
} from '@/d.ts/schedule';
import { ScheduleDetailType } from '@/d.ts/schedule';
import { SchedulePageMode } from '../interface';
import { useLoop } from '@/util/hooks/useLoop';
import scheduleStore from '@/store/schedule';

const loopStatus = [ScheduleStatus.ENABLED, ScheduleStatus.PAUSE, ScheduleStatus.CREATING];
interface IProps {
  taskOpenRef?: React.RefObject<boolean>;
  type: ScheduleType;
  detailId: number;
  visible: boolean;
  enabledAction?: boolean;
  theme?: string;
  detailType?: ScheduleDetailType;
  onReloadList?: () => void;
  onDetailVisible: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
  onApprovalVisible?: (status: boolean, id: number) => void;
  mode?: SchedulePageMode;
}

const ScheduleDetail: React.FC<IProps> = React.memo((props) => {
  const {
    visible,
    detailId,
    enabledAction = true,
    theme,
    onApprovalVisible,
    detailType: propsDetailType,
    mode,
  } = props;
  const [schedule, setSchedule] = useState<IScheduleRecord<ScheduleRecordParameters>>(null);
  const [detailType, setDetailType] = useState<ScheduleDetailType>(ScheduleDetailType.INFO);
  const [loading, setLoading] = useState(false);
  let taskContent = null;

  const { loop: getSchedule, destory } = useLoop((count) => {
    return async () => {
      if (schedule?.status && loopStatus?.includes(schedule?.status)) {
        destory();
        return;
      }
      const data = await getScheduleDetail(detailId);
      setLoading(false);
      if (data) {
        setSchedule(data);
      }
    };
  }, 6500);

  useEffect(() => {
    if (propsDetailType) {
      setDetailType(propsDetailType);
    }
  }, [propsDetailType]);

  const loadCycleTaskData = async (args?: ITableLoadOptions) => {
    getSchedule();
  };

  const resetModal = () => {
    setSchedule(null);
    setDetailType(ScheduleDetailType.INFO);
    scheduleStore.setOpenOperationId(null);
  };

  useEffect(() => {
    if (visible && detailId) {
      loadCycleTaskData();
    }
  }, [detailId, visible]);

  useEffect(() => {
    if (!visible) {
      resetModal();
      destory();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && detailId && !schedule) {
      setLoading(true);
    }
  }, [schedule, visible, detailId]);

  const handleDetailTypeChange = (type: ScheduleDetailType) => {
    setDetailType(type);
  };

  const onClose = () => {
    props.onDetailVisible(null, false);
  };

  switch (schedule?.type) {
    case ScheduleType.PARTITION_PLAN: {
      taskContent = (
        <PartitionScheduleContent schedule={schedule as IScheduleRecord<IPartitionPlan>} />
      );
      break;
    }

    case ScheduleType.DATA_ARCHIVE: {
      taskContent = (
        <DataArchiveScheduleContent
          schedule={schedule as IScheduleRecord<IDataArchiveParameters>}
        />
      );
      break;
    }
    case ScheduleType.DATA_DELETE: {
      taskContent = (
        <DataClearScheduleContent schedule={schedule as IScheduleRecord<IDataClearParameters>} />
      );
      break;
    }
    case ScheduleType.SQL_PLAN: {
      taskContent = (
        <SQLPlanScheduleContent schedule={schedule as IScheduleRecord<ISqlPlanParameters>} />
      );
      break;
    }
  }

  return (
    <ScheduleDetailModal
      width={1200}
      mode={mode}
      visible={visible}
      onClose={onClose}
      onDetailTypeChange={handleDetailTypeChange}
      detailType={detailType}
      isLoading={loading}
      taskContent={taskContent}
      schedule={schedule}
      enabledAction={enabledAction}
      onApprovalVisible={onApprovalVisible}
    />
  );
});

export default ScheduleDetail;
