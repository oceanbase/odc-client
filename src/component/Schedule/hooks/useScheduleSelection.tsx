import {
  IScheduleRecord,
  SchedulePageType,
  ScheduleRecordParameters,
  ScheduleStatus,
} from '@/d.ts/schedule';
import { ScheduleStore } from '@/store/schedule';
import type { IResponseData } from '@/d.ts';
import type { ITableInstance } from '@/component/CommonTable/interface';
import { useEffect, useState, useMemo } from 'react';
import odc from '@/plugins/odc';
import {
  scheduleStatusThatCanBeExport,
  scheduleThatCanBeExport,
  SchedulestatusThatCanBeTerminate,
} from '@/constant/triangularization';

const isSupportTaksExport = odc?.appConfig?.task?.isSupportTaksExport;
const isSupportTaksImport = odc?.appConfig?.task?.isSupportTaksImport;
const isSupportTaksTerminate = odc?.appConfig?.task?.isSupportTaksTerminate;

interface UseTaskSelectionProps {
  scheduleStore: ScheduleStore;
  scheduleTabType: SchedulePageType;
  ScheduleRes: IResponseData<IScheduleRecord<ScheduleRecordParameters>>;
  tableRef: React.RefObject<ITableInstance>;
}

const useScheduleSelection = ({
  scheduleStore,
  scheduleTabType,
  ScheduleRes,
  tableRef,
}: UseTaskSelectionProps) => {
  const [selectedRow, setSelectedRow] = useState<IScheduleRecord<ScheduleRecordParameters>[]>();

  // 当任务列表数据变化时，清理无效的selectedRowKeys
  useEffect(() => {
    if (ScheduleRes?.contents?.length > 0 && scheduleStore.selectedRowKeys.length > 0) {
      const rules = scheduleThatCanBeExport.includes(scheduleTabType)
        ? [...scheduleStatusThatCanBeExport, ...SchedulestatusThatCanBeTerminate]
        : [...SchedulestatusThatCanBeTerminate];

      const validSelectedRowKeys = scheduleStore.selectedRowKeys.filter((keyId) => {
        const taskInCurrentList = ScheduleRes.contents.find(
          (schedule) => schedule.scheduleId === keyId,
        );
        return taskInCurrentList && rules.includes(taskInCurrentList.status);
      });

      // 更新store
      if (validSelectedRowKeys.length !== scheduleStore.selectedRowKeys.length) {
        scheduleStore.setSelectedRowKeys(validSelectedRowKeys);
        setSelectedRow(selectedRow?.filter((row) => validSelectedRowKeys.includes(row.scheduleId)));
        tableRef.current?.setSelectedRowKeys(validSelectedRowKeys);
      }
    }
  }, [ScheduleRes?.contents]);

  useEffect(() => {
    if (ScheduleRes?.contents?.length > 0) {
      const selectedRows = ScheduleRes.contents.filter((row) =>
        scheduleStore.selectedRowKeys.includes(row.scheduleId),
      ) as IScheduleRecord<ScheduleRecordParameters>[];
      setSelectedRow(selectedRows);
    } else {
      setSelectedRow([]);
    }
  }, [scheduleStore.selectedRowKeys, ScheduleRes?.contents]);

  useEffect(() => {
    if (scheduleStore.selectedRowKeys.length === 0) {
      tableRef.current?.resetSelectedRows?.();
    }
  }, [scheduleStore.selectedRowKeys]);

  const rowSelection = useMemo(() => {
    const rules = scheduleThatCanBeExport.includes(scheduleTabType)
      ? [...scheduleStatusThatCanBeExport, ...SchedulestatusThatCanBeTerminate]
      : [...SchedulestatusThatCanBeTerminate];

    return {
      selectedRowKeys: scheduleStore.selectedRowKeys,
      options: [],
      onChange: (
        selectedRowKeys: React.Key[],
        selectedRows: IScheduleRecord<ScheduleRecordParameters>[],
      ) => {
        scheduleStore.setSelectedRowKeys(selectedRowKeys);
        setSelectedRow(selectedRows);
      },
      getCheckboxProps: (record: IScheduleRecord<ScheduleRecordParameters>) => {
        return {
          disabled: !rules?.includes(record.status),
          name: record.scheduleId?.toString(),
        };
      },
    };
  }, [scheduleStore.selectedRowKeys, scheduleTabType]);

  const clearSelection = () => {
    setSelectedRow([]);
    scheduleStore.setSelectedRowKeys([]);
  };

  return {
    selectedRow,
    setSelectedRow,
    rowSelection:
      isSupportTaksExport || isSupportTaksImport || isSupportTaksTerminate
        ? rowSelection
        : undefined,
    clearSelection,
  };
};

export default useScheduleSelection;
