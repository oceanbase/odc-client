import { formatMessage } from '@/util/intl';
import React, { useMemo, useState, useEffect } from 'react';
import { IDatasourceInfo } from '.';
import {
  IImportDatabaseView,
  IImportScheduleTaskView,
  ScheduleNonImportableType,
  ScheduleNonImportableTypeMap,
} from '@/d.ts/importTask';
import { Tooltip, Popover, Table, Descriptions, Typography, Empty, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TaskType } from '@/d.ts';
import { ConnectTypeText } from '@/constant/label';
import Icon from '@ant-design/icons';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getCloudProviderName } from '../AsyncTaskOperationButton/helper';
import { fromODCPRoviderToProvider } from '@/d.ts/migrateTask';

interface ImportPreviewTableProps {
  data: IImportScheduleTaskView[];
  loading?: boolean;
  datasourceInfo: IDatasourceInfo;
  taskType: TaskType;
}

const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ data, loading, taskType }) => {
  const [tableType, setTableType] = useState<ScheduleNonImportableType | 'importable'>(
    'importable',
  );

  const DatabaseInfoPopover = ({
    title,
    value,
    width,
    children,
  }: {
    title: string;
    value: IImportDatabaseView;
    width: number;
    children: React.JSX.Element;
  }) => {
    const items = [
      {
        key: 'datasource',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.A8BC98CA',
          defaultMessage: '数据源',
        }),
        children: value?.name,
      },
      {
        key: 'databaseName',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.0B1F9DCD',
          defaultMessage: '数据库',
        }),
        children: value?.databaseName,
      },
      {
        key: 'type',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.263EFA83',
          defaultMessage: '类型',
        }),
        children: (
          <div style={{ display: 'flex', gap: 6 }}>
            <Icon
              style={{
                color: getDataSourceStyleByConnectType(value?.type)?.icon?.color,
                fontSize: 16,
              }}
              component={getDataSourceStyleByConnectType(value?.type)?.icon?.component}
            />

            {ConnectTypeText(value?.type)}
          </div>
        ),
      },
      {
        key: 'cloudProvider',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.40440087',
          defaultMessage: '云厂商',
        }),
        children: (
          <div style={{ display: 'flex', gap: 6 }}>
            {getCloudProviderName(fromODCPRoviderToProvider[value?.cloudProvider]) || '-'}
          </div>
        ),
      },
      {
        key: 'region',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.F2C95E45',
          defaultMessage: '地域',
        }),
        children: <div style={{ display: 'flex', gap: 6 }}>{value?.region || '-'}</div>,
      },
      {
        key: 'host',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.EFE4E0D0',
          defaultMessage: '连接信息',
        }),
        children: (
          <Tooltip title={`${value?.host}:${value?.port}`}>
            {value?.host}:{value?.port}
          </Tooltip>
        ),
      },
      {
        key: 'instanceNickName',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.4A911A47',
          defaultMessage: '实例名称',
        }),
        children: value?.instanceNickName || value?.instanceId || '-',
      },
      {
        key: 'tenantNickName',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.396EF2AD',
          defaultMessage: '租户名称',
        }),
        children: value?.tenantNickName || value?.tenantId || '-',
      },
      {
        key: 'username',
        label: formatMessage({
          id: 'src.component.Task.component.ImportModal.5928CAE8',
          defaultMessage: '数据库账号',
        }),
        children: value?.username || '-',
      },
    ];

    return (
      <Popover
        title={''}
        content={
          value ? (
            <>
              <h3>{title}</h3>
              <Descriptions column={1} style={{ width: width }}>
                {items?.map((i) => {
                  return (
                    <Descriptions.Item key={i?.key} label={i?.label}>
                      {i?.children}
                    </Descriptions.Item>
                  );
                })}
              </Descriptions>
            </>
          ) : null
        }
      >
        <div>
          <div style={{ width: width || '' }}>{children}</div>
        </div>
      </Popover>
    );
  };

  const dlmColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.B4E8467F',
        defaultMessage: '源端数据库',
      }),
      dataIndex: 'databaseView',
      key: 'databaseView',
      render: (_: IImportDatabaseView) => {
        if (!_) return '-';
        return (
          <DatabaseInfoPopover
            title={formatMessage({
              id: 'src.component.Task.component.ImportModal.50582618',
              defaultMessage: '源端数据库',
            })}
            value={_}
            width={286}
          >
            <Typography.Text ellipsis style={{ width: '160px' }}>
              {_ ? `${_?.name} / ${_?.databaseName}` : '-'}
            </Typography.Text>
          </DatabaseInfoPopover>
        );
      },
      width: 200,
      ellipsis: true,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.76F572C8',
        defaultMessage: '目标端数据库',
      }),
      dataIndex: 'targetDatabaseView',
      key: 'targetDatabaseView',
      render: (_: IImportDatabaseView) => {
        if (!_) return '-';
        return (
          <DatabaseInfoPopover
            title={formatMessage({
              id: 'src.component.Task.component.ImportModal.776397D6',
              defaultMessage: '目标端数据库',
            })}
            value={_}
            width={286}
          >
            <Typography.Text ellipsis style={{ width: '160px' }}>
              {_ ? `${_?.name} / ${_?.databaseName}` : '-'}
            </Typography.Text>
          </DatabaseInfoPopover>
        );
      },
      width: 200,
      ellipsis: true,
    },
  ];

  const otherScheduleColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.B5C62BDC',
        defaultMessage: '工单描述',
      }),
      dataIndex: 'description',
      key: 'description',
      width: 340,
      render: (_, record) => {
        return _ || '-';
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.1EB75659',
        defaultMessage: '数据库',
      }),
      dataIndex: 'databaseView',
      key: 'databaseView',
      render: (_: IImportDatabaseView) => {
        console.log('databaseView', _);
        if (!_) return '-';
        return (
          <DatabaseInfoPopover
            title={formatMessage({
              id: 'src.component.Task.component.ImportModal.8D781AC2',
              defaultMessage: '数据库',
            })}
            value={_}
            width={286}
          >
            <Typography.Text ellipsis style={{ width: '160px' }}>
              {_ ? `${_?.name} / ${_?.databaseName}` : '-'}
            </Typography.Text>
          </DatabaseInfoPopover>
        );
      },
      width: 200,
      ellipsis: true,
    },
  ];

  const columns: ColumnsType<IImportScheduleTaskView> = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.5DE578E8',
        defaultMessage: '原编号',
      }),
      dataIndex: 'originId',
      key: 'originId',
      width: 100,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.2043ADA9',
        defaultMessage: '原项目',
      }),
      dataIndex: 'originProjectName',
      key: 'originProjectName',
      width: 100,
      render: (_) => {
        return _ || '-';
      },
    },
    // 数据清理/归档有源端目标端, 分区计划和sql计划只有数据库
    ...([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE]?.includes(taskType) ? dlmColumns : []),
    ...([TaskType.SQL_PLAN, TaskType.PARTITION_PLAN]?.includes(taskType)
      ? otherScheduleColumns
      : []),
  ]?.filter(Boolean);

  const groupedData = useMemo(() => {
    return data.reduce(
      (
        acc: Record<ScheduleNonImportableType | 'importable', IImportScheduleTaskView[]>,

        item,
      ) => {
        const groupKey = item.importable ? 'importable' : item.nonImportableType;
        acc[groupKey] = acc[groupKey] || [];
        acc[groupKey].push(item);
        return acc;
      },
      {} as Record<ScheduleNonImportableType | 'importable', IImportScheduleTaskView[]>,
    );
  }, [data]);

  // 当数据变化时，如果当前tableType不存在则重置为'importable'
  useEffect(() => {
    if (data?.length > 0 && groupedData[tableType] === undefined) {
      setTableType('importable');
    }
  }, [data]);

  const tableRender = () => {
    if (tableType === 'importable' && !groupedData['importable']) {
      return (
        <Empty
          description={formatMessage({
            id: 'src.component.Task.component.ImportModal.1BF95006',
            defaultMessage: '暂无可导入的作业',
          })}
          style={{ padding: 24 }}
        />
      );
    }
    return (
      <>
        <Table
          columns={columns}
          dataSource={groupedData[tableType] || []}
          loading={loading}
          pagination={false}
          scroll={{ y: 300 }}
        />
      </>
    );
  };

  return (
    <>
      {groupedData['importable']?.length !== data?.length ? (
        <Radio.Group
          value={tableType}
          onChange={(e) => setTableType(e.target.value)}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value={'importable'} key={'importable'}>
            {formatMessage({
              id: 'src.component.Task.component.ImportModal.E8DE787E',
              defaultMessage: '可导入',
            })}

            <Typography.Text type="secondary" style={{ paddingLeft: 4 }}>
              {groupedData['importable']?.length || 0}
            </Typography.Text>
          </Radio.Button>
          {Object.keys(ScheduleNonImportableType)?.map((key) => {
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
      ) : null}
      {tableRender()}
    </>
  );
};

export default ImportPreviewTable;
