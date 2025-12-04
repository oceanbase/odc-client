import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/data/dateTime';
import React, { useEffect, useRef, useState } from 'react';
import {
  IScheduleRecord,
  ScheduleRecordParameters,
  IPartitionPlan,
  ScheduleType,
} from '@/d.ts/schedule';
import PartitionPlanHeader from './components/PartitionPlanHeader';
import ScheduleTaskActions from '../Actions/ScheduleTaskActions';
import { listScheduleTasks } from '@/common/network/schedule';
import {
  IScheduleTaskExecutionDetail,
  scheduleTask,
  ScheduleTaskDetailType,
  SubTaskParameters,
} from '@/d.ts/scheduleTask';
import ScheduleTaskStatusLabel from '../ScheduleTaskStatusLabel';
import SubTaskDetailModal from '@/component/Schedule/layout/SubTaskDetail';
import ExecutionInfoContainer from '@/component/Schedule/components/ExecutionInfoContainer';
import { useLoop } from '@/util/hooks/useLoop';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IResponseData } from '@/d.ts';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import { PartitionTypeExecutionMethod } from './components/PartitionPlanHeader';
import styles from './index.less';

const getConnectionColumns = (params: {
  reloadList: () => void;
  onOpenDetail: (
    task: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>,
    visible: boolean,
  ) => void;
  schedule: IScheduleRecord<ScheduleRecordParameters>;
  scheduleId: number;
}) => {
  const { onOpenDetail, schedule, scheduleId, reloadList } = params;
  return [
    {
      dataIndex: 'id',
      title: formatMessage({
        id: 'src.component.Schedule.components.OperationRecord.BA04149E',
        defaultMessage: '执行记录ID',
      }),
      ellipsis: true,
      width: 80,
      render: (id, record) => {
        return (
          <span
            className={styles.hoverLink}
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
      title: formatMessage({
        id: 'src.component.Schedule.components.OperationRecord.D711C5BB',
        defaultMessage: '任务类型',
      }),
      ellipsis: true,
      width: 200,
      render: (type) => SubTypeTextMap[type],
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
      title: formatMessage({
        id: 'src.component.Schedule.components.OperationRecord.FEE534E6',
        defaultMessage: '状态',
      }),
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
            scheduleId={scheduleId}
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
  const [subTaskRes, setSubTaskRes] =
    useState<IResponseData<scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>>>();
  const [detailId, setDetailId] = useState<number>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [parentId, setParentId] = useState<number>();
  const tableRef = useRef();
  const [listScheduleId, setListScheduleId] = useState<number>(schedule?.scheduleId);
  const [lastExecuteTime, setlastExecuteTime] = useState<number>(undefined);

  const { loop: loadData, destory } = useLoop(() => {
    return async (params: { page: number; size: number }) => {
      if (!params?.size) return;
      const res = await listScheduleTasks({
        scheduleId: listScheduleId,
        ...params,
      });
      if (params?.page === 1) {
        setlastExecuteTime(res?.contents[0]?.createTime);
      }
      setSubTaskRes(res);
    };
  }, 6000);

  const handleDetailVisible = async (
    task: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>,
    visible: boolean = false,
  ) => {
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
        <PartitionPlanHeader
          schedule={schedule as IScheduleRecord<IPartitionPlan>}
          lastExecuteTime={lastExecuteTime}
          onTabChange={(type) => {
            // 分区计划有删除分区策略时，请求创建分区时和删除分区时的执行列表应的作业id不一样，删除策略时的执行列表用subScheduleId请求
            if (type === PartitionTypeExecutionMethod?.DropPartition && schedule?.subScheduleId) {
              setListScheduleId(schedule?.subScheduleId);
            } else {
              setListScheduleId(schedule?.scheduleId);
            }
          }}
        />
      )}
      {schedule?.type !== ScheduleType.PARTITION_PLAN && (
        <ExecutionInfoContainer
          type={schedule?.type}
          trigger={schedule?.triggerConfig}
          fireTimes={schedule?.nextFireTimes}
          lastExecuteTime={lastExecuteTime}
        />
      )}
      <div style={{ flex: 1 }}>
        <CommonTable
          key={listScheduleId}
          mode={CommonTableMode.SMALL}
          ref={tableRef}
          titleContent={null}
          showToolbar={false}
          tableProps={{
            rowKey: 'id',
            rowClassName: styles.tableRow,
            dataSource: subTaskRes?.contents,
            columns: getConnectionColumns({
              onOpenDetail: handleDetailVisible,
              reloadList,
              schedule,
              scheduleId: listScheduleId,
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
        detailTabType={ScheduleTaskDetailType.EXECUTE_RESULT}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        detailId={detailId}
        scheduleId={parentId}
      />
    </div>
  );
};

export default OperationRecord;
