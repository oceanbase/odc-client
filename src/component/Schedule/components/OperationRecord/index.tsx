import DisplayTable from '@/component/DisplayTable';
import DetailModal from '@/component/Task/modals/DetailModals';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import React, { useEffect, useRef, useState } from 'react';
import {
  IScheduleRecord,
  ScheduleRecordParameters,
  IPartitionPlan,
  ScheduleType,
} from '@/d.ts/schedule';
import PartitionPlanHeader from './components/PartitionPlanHeader';
import ScheduleTaskActions from '../Actions/ScheduleTaskActions';
import { listScheduleTasks, detailScheduleTask } from '@/common/network/schedule';
import { scheduleTask } from '@/d.ts/scheduleTask';
import ScheduleTaskStatusLabel from '../ScheduleTaskStatusLabel';
import SubTaskDetailModal from '@/component/Schedule/layout/SubTaskDetail';
import ExecutionInfoContainer from '@/component/Schedule/components/ExecutionInfoContainer';
import { ScheduleTextMap } from '@/constant/schedule';
import { useLoop } from '@/util/hooks/useLoop';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IResponseData } from '@/d.ts';

const getConnectionColumns = (params: {
  reloadList: () => void;
  onOpenDetail: (task: scheduleTask, visible: boolean) => void;
  schedule: IScheduleRecord<ScheduleRecordParameters>;
}) => {
  const { onOpenDetail, schedule, reloadList } = params;
  return [
    {
      dataIndex: 'id',
      title: '执行记录ID',
      ellipsis: true,
      width: 80,
      render: (id, record) => {
        return (
          <span
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => {
              onOpenDetail(record, true);
            }}
          >
            #{id}
          </span>
        );
      },
    },

    {
      dataIndex: 'type',
      title: '任务类型',
      ellipsis: true,
      width: 200,
      render: (type) => ScheduleTextMap[type],
    },

    {
      dataIndex: 'createTime',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.CreationTime',
        defaultMessage: '创建时间',
      }), //创建时间
      ellipsis: true,
      width: 180,
      render: (createTime) => getFormatDateTime(createTime),
    },

    {
      dataIndex: 'status',
      title: '状态',
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return <ScheduleTaskStatusLabel status={status} />;
      },
    },

    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonTaskDetailModal.TaskRecord.Operation',
        defaultMessage: '操作',
      }), //操作
      ellipsis: true,
      width: 92,
      render: (_, record) => {
        return (
          <ScheduleTaskActions
            onReloadList={reloadList}
            scheduleId={schedule?.scheduleId}
            subTask={{
              ...record,
              currentUserResourceRoles: schedule?.project?.currentUserResourceRoles,
            }}
            handleView={() => onOpenDetail(record, true)}
          />
        );
      },
    },
  ];
};

interface IProps {
  schedule: IScheduleRecord<ScheduleRecordParameters>;
}

const OperationRecord: React.FC<IProps> = (props) => {
  const { schedule } = props;
  const [subTaskRes, setSubTaskRes] = useState<IResponseData<scheduleTask>>();
  const [detailId, setDetailId] = useState<number>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [parentId, setParentId] = useState<number>();
  const tableRef = useRef();

  const { loop: loadData, destory } = useLoop(() => {
    return async (params: { page: number; size: number }) => {
      if (!params?.size) return;
      const res = await listScheduleTasks({
        scheduleId: schedule?.scheduleId,
        ...params,
      });
      setSubTaskRes(res);
    };
  }, 6000);

  const handleDetailVisible = async (task: scheduleTask, visible: boolean = false) => {
    setDetailId(task?.id);
    setParentId(Number(task?.jobName));
    setDetailVisible(visible);
  };

  const reloadList = () => {
    loadData({
      page: subTaskRes.page.number,
      size: subTaskRes.page.size,
    });
  };

  useEffect(() => {
    return () => {
      destory?.();
    };
  }, []);

  const handleLoad = async (args?: ITableLoadOptions) => {
    loadData({
      page: 1,
      size: args?.pageSize,
    });
  };

  const handleReload = async (args?: ITableLoadOptions) => {
    loadData({
      page: args?.pagination?.current,
      size: args?.pagination?.pageSize,
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {schedule?.type === ScheduleType.PARTITION_PLAN && (
        <PartitionPlanHeader schedule={schedule as IScheduleRecord<IPartitionPlan>} />
      )}
      {schedule?.type !== ScheduleType.PARTITION_PLAN && (
        <ExecutionInfoContainer
          type={schedule?.type}
          trigger={schedule?.triggerConfig}
          fireTimes={schedule?.nextFireTimes}
        />
      )}
      <div style={{ flex: 1 }}>
        <CommonTable
          mode={CommonTableMode.SMALL}
          ref={tableRef}
          titleContent={null}
          showToolbar={false}
          tableProps={{
            rowKey: 'id',
            dataSource: subTaskRes?.contents,
            columns: getConnectionColumns({
              onOpenDetail: handleDetailVisible,
              reloadList,
              schedule,
            }),
            pagination: {
              current: subTaskRes?.page?.number,
              total: subTaskRes?.page?.totalElements,
            },
          }}
          onLoad={handleLoad}
          onChange={handleReload}
        />
      </div>

      <SubTaskDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        detailId={detailId}
        scheduleId={parentId}
      />
    </div>
  );
};

export default OperationRecord;
