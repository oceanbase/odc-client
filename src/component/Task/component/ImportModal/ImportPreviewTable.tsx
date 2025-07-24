import { formatMessage } from '@/util/intl';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { IDatasourceInfo, IMPORTABLE_TYPE } from '.';
import {
  IImportDatabaseView,
  IImportScheduleTaskView,
  ScheduleNonImportableType,
  ScheduleNonImportableTypeMap,
} from '@/d.ts/importTask';
import { Tooltip, Table, Typography, Empty, Radio, Checkbox, Flex } from 'antd';
import { TaskType, ConnectType } from '@/d.ts';
import { useColumns } from './useColumn';

interface ImportPreviewTableProps {
  data: IImportScheduleTaskView[];
  loading?: boolean;
  datasourceInfo: IDatasourceInfo;
  taskType: TaskType;
  projectId: number;
  selectedRowKeys: string[];
  setSelectedRowKeys: (selectedRowKeys: string[]) => void;
  databaseSelections: Record<
    string,
    { databaseId: number | null; targetDatabaseId: number | null }
  >;
  setDatabaseSelections: React.Dispatch<
    React.SetStateAction<
      Record<string, { databaseId: number | null; targetDatabaseId: number | null }>
    >
  >;
}

const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({
  loading,
  taskType,
  projectId,
  data,
  selectedRowKeys,
  setSelectedRowKeys,
  databaseSelections,
  setDatabaseSelections,
}) => {
  const [showOnlyImportable, setShowOnlyImportable] = useState(false);
  const groupedData = useMemo(() => {
    return data.reduce(
      (
        acc: Record<ScheduleNonImportableType | 'TO_BE_IMPORTED', IImportScheduleTaskView[]>,
        item,
      ) => {
        let groupKey: ScheduleNonImportableType | 'TO_BE_IMPORTED';

        if (
          item.importable ||
          item.nonImportableType === ScheduleNonImportableType.DATASOURCE_NON_EXIST ||
          item.nonImportableType === ScheduleNonImportableType.LACK_OF_INSTANCE
        ) {
          groupKey = 'TO_BE_IMPORTED';
        } else {
          groupKey = item.nonImportableType;
        }

        acc[groupKey] = acc[groupKey] || [];
        acc[groupKey].push(item);
        return acc;
      },
      {} as Record<ScheduleNonImportableType | 'TO_BE_IMPORTED', IImportScheduleTaskView[]>,
    );
  }, [data]);

  const [tableType, setTableType] = useState<ScheduleNonImportableType | 'TO_BE_IMPORTED'>(
    groupedData?.['TO_BE_IMPORTED']?.length > 0
      ? 'TO_BE_IMPORTED'
      : Object.values(ScheduleNonImportableType).find((key) => groupedData?.[key]?.length > 0) ||
          'TO_BE_IMPORTED',
  );
  // 检查一个工单是否已经选择了所需的数据库
  const hasSelectedAllDatabases = useCallback(
    (item: IImportScheduleTaskView) => {
      const hasSourceDatabase =
        item.databaseView?.matchedDatabaseId || databaseSelections[item.originId]?.databaseId;
      const hasTargetDatabase =
        item.targetDatabaseView?.matchedDatabaseId ||
        databaseSelections[item.originId]?.targetDatabaseId ||
        !item?.targetDatabaseView;

      // 如果是数据清理/归档任务，需要检查源端和目标端
      if ([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE].includes(taskType)) {
        return hasSourceDatabase && hasTargetDatabase;
      }
      // 其他任务类型只需要检查源端
      return hasSourceDatabase;
    },
    [databaseSelections, taskType],
  );

  // 判断工单是否应该被选中
  const shouldBeSelected = useCallback(
    (item: IImportScheduleTaskView) => {
      if (item.importable) return true;

      if (
        item.nonImportableType === ScheduleNonImportableType.DATASOURCE_NON_EXIST ||
        item.nonImportableType === ScheduleNonImportableType.LACK_OF_INSTANCE
      ) {
        return hasSelectedAllDatabases(item);
      }

      return false;
    },
    [hasSelectedAllDatabases],
  );

  // 更新选中状态
  const updateSelectedRowKeys = useCallback(() => {
    if (!data?.length) return;

    const selectedIds = data.filter((item) => shouldBeSelected(item)).map((item) => item.originId);

    setSelectedRowKeys(selectedIds);
  }, [data, shouldBeSelected, setSelectedRowKeys]);

  // 初始化和数据变化时更新选中状态
  useEffect(() => {
    updateSelectedRowKeys();
  }, [data, updateSelectedRowKeys]);

  // 数据库选择变化时更新选中状态
  useEffect(() => {
    updateSelectedRowKeys();
  }, [databaseSelections, updateSelectedRowKeys]);

  const handleDatabaseChange = useCallback(
    (originId: string, type: 'databaseId' | 'targetDatabaseId', databaseId: number) => {
      setDatabaseSelections((prev) => ({
        ...prev,
        [originId]: {
          databaseId: type === 'databaseId' ? databaseId : prev[originId]?.databaseId ?? null,
          targetDatabaseId:
            type === 'targetDatabaseId' ? databaseId : prev[originId]?.targetDatabaseId ?? null,
        },
      }));
    },
    [],
  );

  const { importableColumns, typeNotMatchColumns, alreadyExistColumns } = useColumns(
    taskType,
    projectId,
    handleDatabaseChange,
  );

  const handleShowOnlyImportableChange = useCallback(
    (checked: boolean) => {
      setShowOnlyImportable(checked);
      if (checked) {
        updateSelectedRowKeys();
      }
    },
    [updateSelectedRowKeys],
  );

  const getFilteredData = useCallback(
    (data: IImportScheduleTaskView[]) => {
      if (!showOnlyImportable) {
        return data;
      }
      return data.filter(shouldBeSelected);
    },
    [showOnlyImportable, shouldBeSelected],
  );

  const tableRender = () => {
    return (
      <>
        <div style={{ display: tableType === 'TO_BE_IMPORTED' ? 'block' : 'none' }}>
          {!groupedData['TO_BE_IMPORTED'] ? (
            <Empty
              description={formatMessage({
                id: 'src.component.Task.component.ImportModal.1BF95006',
                defaultMessage: '暂无可导入的作业',
              })}
              style={{ padding: 24 }}
            />
          ) : (
            <Table
              columns={importableColumns}
              dataSource={getFilteredData(groupedData['TO_BE_IMPORTED'] || [])}
              loading={loading}
              pagination={false}
              scroll={{ y: 300 }}
              rowKey="originId"
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: (selectedRowKeys) => {
                  setSelectedRowKeys(selectedRowKeys as string[]);
                },
                getCheckboxProps: (record) => ({
                  disabled: !(
                    record.importable ||
                    ((record.nonImportableType === ScheduleNonImportableType.DATASOURCE_NON_EXIST ||
                      record.nonImportableType === ScheduleNonImportableType.LACK_OF_INSTANCE) &&
                      hasSelectedAllDatabases(record))
                  ),
                }),
              }}
            />
          )}
        </div>
        <div
          style={{
            display: tableType === ScheduleNonImportableType.TYPE_NOT_MATCH ? 'block' : 'none',
          }}
        >
          <Table
            columns={typeNotMatchColumns}
            dataSource={getFilteredData(
              groupedData[ScheduleNonImportableType.TYPE_NOT_MATCH] || [],
            )}
            loading={loading}
            pagination={false}
            scroll={{ y: 300 }}
            rowKey="originId"
          />
        </div>
        <div
          style={{ display: tableType === ScheduleNonImportableType.IMPORTED ? 'block' : 'none' }}
        >
          <Table
            columns={alreadyExistColumns}
            dataSource={getFilteredData(groupedData[ScheduleNonImportableType.IMPORTED] || [])}
            loading={loading}
            pagination={false}
            scroll={{ y: 300 }}
            rowKey="originId"
          />
        </div>
      </>
    );
  };

  const tablePrefixRender = (type: ScheduleNonImportableType | 'TO_BE_IMPORTED') => {
    const map = {
      TO_BE_IMPORTED: (
        <Flex justify="space-between" style={{ marginBottom: 16 }}>
          勾选需要导入的工单，导入后将重新启用。导入前请检查涉及的新旧数据库对象是否一致，否则导入或执行时可能出现失败。
          <Checkbox
            checked={showOnlyImportable}
            onChange={(e) => handleShowOnlyImportableChange(e.target.checked)}
          >
            仅显示已选择数据库的工单
          </Checkbox>
        </Flex>
      ),
      [ScheduleNonImportableType.IMPORTED]: (
        <div style={{ paddingBottom: 8 }}>以下工单已导入，无需重复操作。</div>
      ),
      [ScheduleNonImportableType.TYPE_NOT_MATCH]: (
        <div style={{ paddingBottom: 8 }}>
          以下工单类型不匹配、无法导入，建议选择对应工单类型重新导入。
        </div>
      ),
    };
    return map[type];
  };

  return (
    <>
      <Radio.Group
        value={tableType}
        onChange={(e) => setTableType(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        {groupedData['TO_BE_IMPORTED']?.length > 0 && (
          <Radio.Button value={'TO_BE_IMPORTED'} key={'TO_BE_IMPORTED'}>
            待导入
            <Typography.Text type="secondary" style={{ paddingLeft: 4 }}>
              {groupedData['TO_BE_IMPORTED']?.length || 0}
            </Typography.Text>
          </Radio.Button>
        )}
        {Object.keys(ScheduleNonImportableType)
          ?.filter(
            (key) =>
              key !== ScheduleNonImportableType.DATASOURCE_NON_EXIST &&
              key !== ScheduleNonImportableType.LACK_OF_INSTANCE &&
              groupedData[key as ScheduleNonImportableType]?.length > 0,
          )
          ?.map((key) => {
            return (
              <Radio.Button value={key} key={key}>
                {ScheduleNonImportableTypeMap[key as ScheduleNonImportableType]}{' '}
                {key === tableType ? (
                  groupedData[key as ScheduleNonImportableType]?.length || 0
                ) : (
                  <Typography.Text type="secondary">
                    {groupedData[key as ScheduleNonImportableType]?.length || 0}
                  </Typography.Text>
                )}
              </Radio.Button>
            );
          })}
      </Radio.Group>
      {tablePrefixRender(tableType)}
      {tableRender()}
    </>
  );
};

export default ImportPreviewTable;
