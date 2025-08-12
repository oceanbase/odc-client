import { formatMessage } from '@/util/intl';
import { IImportDatabaseView, IImportScheduleTaskView } from '@/d.ts/importTask';
import { Tooltip, Typography, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TaskStatus, TaskType } from '@/d.ts';
import Icon, { InfoCircleOutlined } from '@ant-design/icons';
import StatusLabel from '../Status';
import DatabaseChangeItem from './DatabaseChangeItem';
import DatabaseInfoPopover from './DatabaseInfoPopover';
import { TaskTypeMap } from '../TaskTable';
import { ReactComponent as SourceDatabase } from '@/svgr/source_database.svg';
import { ReactComponent as TargetDatabase } from '@/svgr/target_database.svg';
import styles from './index.less';

export const useColumns = (
  taskType: TaskType,
  projectId: number,
  handleDatabaseChange: (
    originId: string,
    type: 'databaseId' | 'targetDatabaseId',
    databaseId: number,
  ) => void,
) => {
  const baseInfoColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.7C3EB72C',
        defaultMessage: '工单',
      }),
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
      render: (_, record) => {
        return (
          <Flex vertical gap={4}>
            <Typography.Text ellipsis>{_ || '-'}</Typography.Text>
            <Flex gap={8}>
              <Typography.Text type="secondary">#{record?.originId}</Typography.Text>
              <Typography.Text type="secondary">·</Typography.Text>
              <Typography.Text type="secondary" ellipsis title={record?.originProjectName}>
                {record?.originProjectName}
              </Typography.Text>
            </Flex>
          </Flex>
        );
      },
    },
  ];

  const originDatabaseColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.DCD1BA1A',
        defaultMessage: '原数据库',
      }),
      dataIndex: 'databaseView',
      key: 'databaseView',
      width: 140,
      render: (_: IImportDatabaseView) => {
        if (!_) return '-';
        return (
          <DatabaseInfoPopover
            title={formatMessage({
              id: 'src.component.Task.component.ImportModal.93C2FD0F',
              defaultMessage: '原数据库',
            })}
            value={_}
            popoverWidth={240}
          >
            <Flex vertical gap={4}>
              <Typography.Text
                ellipsis
                className={styles.databasePopoverName}
                title={_?.databaseName}
              >
                {_ ? `${_?.databaseName}` : '-'}
              </Typography.Text>
              <Typography.Text ellipsis type="secondary" title={_?.name}>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.A8B5EF34',
                  defaultMessage: '数据源:',
                })}
                {_?.name}
              </Typography.Text>
            </Flex>
          </DatabaseInfoPopover>
        );
      },
    },
  ];

  const originDatabaseWithTargetColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.4C0466BB',
        defaultMessage: '原数据库',
      }),
      dataIndex: 'databaseId',
      key: 'databaseId',
      width: 150,
      render: (databaseId: number, record: IImportScheduleTaskView) => {
        return (
          <Flex vertical gap={4}>
            <DatabaseInfoPopover
              title={formatMessage({
                id: 'src.component.Task.component.ImportModal.E78A5A7E',
                defaultMessage: '源端数据库',
              })}
              value={record.databaseView}
              popoverWidth={240}
            >
              <Flex gap={4} align="center">
                <Icon component={SourceDatabase} style={{ width: 16, height: 16 }} />
                <Typography.Text
                  ellipsis
                  className={styles.databasePopoverName}
                  title={record.databaseView?.databaseName}
                >
                  {record.databaseView?.databaseName || '-'}
                </Typography.Text>
              </Flex>
            </DatabaseInfoPopover>
            <DatabaseInfoPopover
              title={formatMessage({
                id: 'src.component.Task.component.ImportModal.47F8A3BA',
                defaultMessage: '目标端数据库',
              })}
              value={record.targetDatabaseView}
              popoverWidth={240}
            >
              <Flex gap={4} align="center">
                <Icon component={TargetDatabase} style={{ width: 16, height: 16 }} />
                <Typography.Text
                  ellipsis
                  className={styles.databasePopoverName}
                  title={record.targetDatabaseView?.databaseName}
                >
                  {record.targetDatabaseView?.databaseName || '-'}
                </Typography.Text>
              </Flex>
            </DatabaseInfoPopover>
          </Flex>
        );
      },
    },
  ];

  const originStatusColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.55E87B63',
        defaultMessage: '原状态',
      }),
      dataIndex: 'originStatus',
      key: 'originStatus',
      width: 120,
      render: (status, record) => (
        <Flex gap={4}>
          <StatusLabel status={status} type={record?.type} />
          {status !== TaskStatus.ENABLED && (
            <Tooltip
              title={formatMessage({
                id: 'src.component.Task.component.ImportModal.DFCD4ABB',
                defaultMessage: '工单导入成功后将重新启用',
              })}
            >
              <InfoCircleOutlined style={{ color: 'var(--icon-color-3)' }} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
  ];

  const originDatabaseTypeColumns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.37A63CCA',
        defaultMessage: '类型',
      }),
      dataIndex: 'taskType',
      key: 'taskType',
      width: 120,
      render: (status, record) => {
        return TaskTypeMap[record.type];
      },
    },
  ];

  const dlmColumns = [
    ...originDatabaseWithTargetColumns,
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.D22149A7',
        defaultMessage: '新源端',
      }),
      dataIndex: 'databaseView',
      key: 'databaseView',
      width: 200,
      render: (_: IImportDatabaseView, record: IImportScheduleTaskView) => {
        if (!_) return '-';
        return (
          <DatabaseChangeItem
            defaultDatabaseId={record.databaseView?.matchedDatabaseId}
            taskType={taskType}
            projectId={projectId}
            onChange={(databaseId) =>
              handleDatabaseChange(record.originId, 'databaseId', databaseId)
            }
          />
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.6992AD58',
        defaultMessage: '新目标端',
      }),
      dataIndex: 'targetDatabaseView',
      key: 'targetDatabaseView',
      width: 200,
      render: (_: IImportDatabaseView, record: IImportScheduleTaskView) => {
        if (!_) return '-';
        return (
          <DatabaseChangeItem
            defaultDatabaseId={record.targetDatabaseView?.matchedDatabaseId}
            taskType={taskType}
            projectId={projectId}
            onChange={(databaseId) =>
              handleDatabaseChange(record.originId, 'targetDatabaseId', databaseId)
            }
          />
        );
      },
    },
  ];

  const otherScheduleColumns = [
    ...originDatabaseColumns,
    {
      title: formatMessage({
        id: 'src.component.Task.component.ImportModal.01BA659E',
        defaultMessage: '新数据库',
      }),
      dataIndex: 'databaseView',
      key: 'databaseView',
      width: 200,
      render: (_: IImportDatabaseView, record: IImportScheduleTaskView) => {
        return (
          <DatabaseChangeItem
            defaultDatabaseId={_?.matchedDatabaseId}
            taskType={taskType}
            projectId={projectId}
            onChange={(databaseId) =>
              handleDatabaseChange(record.originId, 'databaseId', databaseId)
            }
          />
        );
      },
    },
  ];

  const typeNotMatchColumns = [
    ...baseInfoColumns,
    ...originDatabaseColumns,
    ...originDatabaseTypeColumns,
  ];

  const alreadyExistColumns = [
    ...baseInfoColumns,
    ...([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE]?.includes(taskType)
      ? originDatabaseWithTargetColumns
      : []),
    ...([TaskType.SQL_PLAN, TaskType.PARTITION_PLAN]?.includes(taskType)
      ? originDatabaseColumns
      : []),
  ];

  const importableColumns: ColumnsType<IImportScheduleTaskView> = [
    ...baseInfoColumns,
    ...originStatusColumns,
    // 数据清理/归档有源端目标端, 分区计划和sql计划只有数据库
    ...([TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE]?.includes(taskType) ? dlmColumns : []),
    ...([TaskType.SQL_PLAN, TaskType.PARTITION_PLAN]?.includes(taskType)
      ? otherScheduleColumns
      : []),
  ]?.filter(Boolean);

  return {
    importableColumns,
    typeNotMatchColumns,
    alreadyExistColumns,
  };
};
