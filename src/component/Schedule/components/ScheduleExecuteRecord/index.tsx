import { ScheduleType, IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';
import React, { useEffect, useState } from 'react';
import { listChangeLog } from '@/common/network/schedule';
import { formatMessage } from '@/util/intl';
import { TaskOperationType, Operation, ScheduleChangeStatus } from '@/d.ts';
import { getFormatDateTime } from '@/util/data/dateTime';
import StatusItem from '@/component/Task/component/TaskDetailModal/status';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import styles from './index.less';
import ScheduleExecuteRecordDetail from '../ScheduleExecuteRecordDetail';
import { inject, observer } from 'mobx-react';
import { ScheduleStore } from '@/store/schedule';
import { useLoop } from '@/util/hooks/useLoop';

export const operationTypeMap = {
  [TaskOperationType.CREATE]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.E618CDAE',
    defaultMessage: '创建作业',
  }),
  [TaskOperationType.UPDATE]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.84429EDA',
    defaultMessage: '编辑作业',
  }), //编辑任务
  [TaskOperationType.PAUSE]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.E16A6D89',
    defaultMessage: '停用作业',
  }), //停用任务
  [TaskOperationType.TERMINATE]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.E7A3B97C',
    defaultMessage: '终止作业',
  }), //终止任务
  [TaskOperationType.RESUME]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.D88590DC',
    defaultMessage: '启用作业',
  }), //启用任务
  [TaskOperationType.DELETE]: formatMessage({
    id: 'src.component.Schedule.components.ScheduleExecuteRecord.80CD6E81',
    defaultMessage: '删除作业',
  }),
};

interface ScheduleExecuteRecordProps {
  schedule: IScheduleRecord<ScheduleRecordParameters>;
  scheduleStore?: ScheduleStore;
}

const ScheduleExecuteRecord: React.FC<ScheduleExecuteRecordProps> = ({
  schedule,
  scheduleStore,
}) => {
  const [opRecord, setOpRecord] = useState<Operation[]>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [operation, setOperation] = useState<Operation>();

  useEffect(() => {
    if (schedule?.scheduleId) {
      loadData();
    }
  }, [schedule?.scheduleId]);

  useEffect(() => {
    return () => {
      destory?.();
    };
  }, []);

  const { loop: loadData, destory } = useLoop(() => {
    return async () => {
      if (schedule?.scheduleId) {
        const res = await listChangeLog(schedule?.scheduleId);
        if (scheduleStore.openOperationId) {
          const opRecord = res?.contents.find((item) => item.id === scheduleStore.openOperationId);
          scheduleStore.setOpenOperationId(null);
          if (opRecord) {
            handleDetailVisible(opRecord, true);
          }
        }
        setOpRecord(res?.contents?.sort((a, b) => b.createTime - a.createTime));
      }
    };
  }, 6500);

  const handleDetailVisible = (operation: Operation, visible: boolean = false) => {
    setOperation(operation as Operation);

    setDetailVisible(visible);
  };

  const getConnectionColumns = (params: {
    onOpenDetail: (operation: Operation, visible: boolean) => void;
    scheduleType: ScheduleType;
  }) => {
    return [
      {
        dataIndex: 'type',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EventOperations',
          defaultMessage: '事件操作',
        }), //事件操作
        ellipsis: true,
        width: 140,
        render: (type) => {
          return <span>{operationTypeMap?.[type]}</span>;
        },
      },

      {
        dataIndex: 'createTime',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.OperationTime',
          defaultMessage: '操作时间',
        }), //操作时间
        ellipsis: true,
        sorter: (a, b) => a.createTime - b.createTime,
        width: 180,
        render: (createTime: number) => getFormatDateTime(createTime),
      },

      {
        dataIndex: 'status',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.ApprovalStatus',
          defaultMessage: '审批状态',
        }), //审批状态
        ellipsis: true,
        width: 140,
        render: (status: ScheduleChangeStatus) => {
          return <StatusItem status={status} />;
        },
      },

      {
        dataIndex: 'action',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.Operation',
          defaultMessage: '操作',
        }), //操作
        ellipsis: true,
        width: 92,
        render: (_, record: Operation) => {
          return (
            <>
              <Action.Link
                onClick={async () => {
                  params?.onOpenDetail(record, true);
                }}
              >
                {formatMessage({
                  id: 'src.component.Schedule.components.ScheduleExecuteRecord.F686ADB8',
                  defaultMessage: '查看',
                })}
              </Action.Link>
            </>
          );
        },
      },
    ];
  };

  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getConnectionColumns({
          onOpenDetail: handleDetailVisible,
          scheduleType: schedule?.type,
        })}
        dataSource={opRecord}
        disablePagination
        scroll={{}}
      />

      <ScheduleExecuteRecordDetail
        schedule={schedule}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        operation={operation}
        onReload={() => {
          loadData();
        }}
      />
    </>
  );
};

export default inject('scheduleStore')(observer(ScheduleExecuteRecord));
