import {
  ScheduleType,
  SchedulePageType,
  IScheduleRecord,
  ScheduleRecordParameters,
  ScheduleStatus,
} from '@/d.ts/schedule';
import React, { useEffect, useState } from 'react';
import { listChangeLog } from '@/common/network/schedule';
import { formatMessage } from '@/util/intl';
import { TaskOperationType, TaskRecord, TaskRecordParameters, Operation, TaskType } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
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
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.CreateATask',
    defaultMessage: '创建任务',
  }), //创建任务
  [TaskOperationType.UPDATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EditTask',
    defaultMessage: '编辑任务',
  }), //编辑任务
  [TaskOperationType.PAUSE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.DisableATask',
    defaultMessage: '停用任务',
  }), //停用任务
  [TaskOperationType.TERMINATE]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.TerminateATask',
    defaultMessage: '终止任务',
  }), //终止任务
  [TaskOperationType.RESUME]: formatMessage({
    id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EnableTasks',
    defaultMessage: '启用任务',
  }), //启用任务
  [TaskOperationType.DELETE]: '删除任务',
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
        if (scheduleStore?.openOperationId) {
          const opRecord = res?.contents.find((item) => item.id === scheduleStore?.openOperationId);
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
        dataIndex: 'id',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.EventOperations',
          defaultMessage: '事件操作',
        }), //事件操作
        ellipsis: true,
        width: 140,
        render: (id, record) => {
          return <span>{operationTypeMap?.[record.type]}</span>;
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
        render: (createTime) => getFormatDateTime(createTime),
      },

      {
        dataIndex: 'status',
        title: formatMessage({
          id: 'odc.component.CommonTaskDetailModal.TaskOperationRecord.ApprovalStatus',
          defaultMessage: '审批状态',
        }), //审批状态
        ellipsis: true,
        width: 140,
        render: (status, record) => {
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
        render: (_, record) => {
          return (
            <>
              <Action.Link
                onClick={async () => {
                  params?.onOpenDetail(record, true);
                }}
              >
                查看
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
        scroll={null}
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
