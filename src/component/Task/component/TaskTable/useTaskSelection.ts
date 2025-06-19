import { useEffect, useState, useMemo } from 'react';
import type {
  TaskRecord,
  TaskRecordParameters,
  ICycleTaskRecord,
  ISqlPlayJobParameters,
  IDataArchiveJobParameters,
  IResponseData,
} from '@/d.ts';
import { TaskPageType, TaskStatus } from '@/d.ts';
import type { TaskStore } from '@/store/task';
import type { ITableInstance } from '@/component/CommonTable/interface';

export const statusThatCanBeExport = Object.keys(TaskStatus);

export const statusThatCanBeTerminate = [
  TaskStatus.CREATING,
  TaskStatus.APPROVING,
  TaskStatus.ENABLED,
  TaskStatus.PAUSE,
  TaskStatus.EXECUTING,
  TaskStatus.WAIT_FOR_EXECUTION,
  TaskStatus.CREATED,
];

export const taskTypeThatCanBeExport = [
  TaskPageType.SQL_PLAN,
  TaskPageType.DATA_ARCHIVE,
  TaskPageType.DATA_DELETE,
  TaskPageType.PARTITION_PLAN,
];

interface UseTaskSelectionProps {
  taskStore: TaskStore;
  taskTabType: TaskPageType;
  taskList: IResponseData<
    | TaskRecord<TaskRecordParameters>
    | ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>
  >;
  tableRef: React.RefObject<ITableInstance>;
}

export const useTaskSelection = ({
  taskStore,
  taskTabType,
  taskList,
  tableRef,
}: UseTaskSelectionProps) => {
  const [selectedRow, setSelectedRow] = useState<TaskRecord<TaskRecordParameters>[]>();

  useEffect(() => {
    setSelectedRow([]);
    taskStore.setSelectedRowKeys([]);
  }, [taskTabType]);

  // 当任务列表数据变化时，清理无效的selectedRowKeys
  useEffect(() => {
    if (taskList?.contents?.length > 0 && taskStore.selectedRowKeys.length > 0) {
      const rules = taskTypeThatCanBeExport.includes(taskTabType)
        ? [...statusThatCanBeExport, ...statusThatCanBeTerminate]
        : [...statusThatCanBeTerminate];

      const validSelectedRowKeys = taskStore.selectedRowKeys.filter((keyId) => {
        const taskInCurrentList = taskList.contents.find((task) => task.id === keyId);
        return taskInCurrentList && rules.includes(taskInCurrentList.status);
      });

      // 更新store
      if (validSelectedRowKeys.length !== taskStore.selectedRowKeys.length) {
        taskStore.setSelectedRowKeys(validSelectedRowKeys);
        setSelectedRow(selectedRow?.filter((row) => validSelectedRowKeys.includes(row.id)));
        tableRef.current?.setSelectedRowKeys(validSelectedRowKeys);
      }
    }
  }, [taskList?.contents]);

  useEffect(() => {
    if (taskList?.contents?.length > 0) {
      const selectedRows = taskList.contents.filter((row) =>
        taskStore.selectedRowKeys.includes(row.id),
      ) as TaskRecord<TaskRecordParameters>[];
      setSelectedRow(selectedRows);
    } else {
      setSelectedRow([]);
    }
  }, [taskStore.selectedRowKeys, taskList?.contents]);

  useEffect(() => {
    if (taskStore.selectedRowKeys.length === 0) {
      tableRef.current?.resetSelectedRows?.();
    }
  }, [taskStore.selectedRowKeys]);

  const rowSelection = useMemo(() => {
    const rules = taskTypeThatCanBeExport.includes(taskTabType)
      ? [...statusThatCanBeExport, ...statusThatCanBeTerminate]
      : [...statusThatCanBeTerminate];

    return {
      selectedRowKeys: taskStore.selectedRowKeys,
      options: [],
      onChange: (
        selectedRowKeys: React.Key[],
        selectedRows: TaskRecord<TaskRecordParameters>[],
      ) => {
        taskStore.setSelectedRowKeys(selectedRowKeys);
        setSelectedRow(selectedRows);
      },
      getCheckboxProps: (
        record:
          | TaskRecord<TaskRecordParameters>
          | ICycleTaskRecord<ISqlPlayJobParameters | IDataArchiveJobParameters>,
      ) => {
        return {
          disabled: !rules?.includes(record.status),
          name: record.id?.toString(),
        };
      },
    };
  }, [taskStore.selectedRowKeys, taskTabType]);

  const clearSelection = () => {
    setSelectedRow([]);
    taskStore.setSelectedRowKeys([]);
  };

  return {
    selectedRow,
    setSelectedRow,
    rowSelection,
    clearSelection,
  };
};
