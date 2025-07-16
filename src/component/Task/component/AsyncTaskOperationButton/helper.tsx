import {
  AsyncTaskType,
  CloudProvider,
  ISwitchOdcTaskListResponse,
  ScheduleExportListView,
} from '@/d.ts/migrateTask';
import { IAsyncTaskOperationConfig } from '.';
import { Popover, Space, Tooltip, Typography } from 'antd';
import { IConnection, TaskDetail, TaskRecordParameters, TaskStatus, TaskType } from '@/d.ts';
import { getLocalFormatDateTime } from '@/util/utils';
import {
  status as TaskStatusMap,
  cycleStatus as scheduleTaskStatusMap,
} from '@/component/Task/component/Status';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import Icon, { ExclamationCircleFilled } from '@ant-design/icons';
import { ConnectTypeText } from '@/constant/label';
import { formatMessage } from '@/util/intl';
import { statusThatCanBeExport, statusThatCanBeTerminate } from '../TaskTable/useTaskSelection';
import { TaskTypeMap } from '../TaskTable/const';

export const DatabasePopover: React.FC<{
  connection: Partial<IConnection>;
  database?: IDatabase;
  showType?: boolean;
}> = (props) => {
  const { connection, database } = props;

  const DBIcon = getDataSourceStyleByConnectType(connection?.type || database?.connectType)?.icon;

  function renderConnectionMode() {
    const { type } = connection;
    return (
      <div>
        {
          formatMessage(
            {
              id: 'odc.component.ConnectionPopover.TypeConnecttypetexttype',
              defaultMessage: '类型：{ConnectTypeTextType}',
            },

            { ConnectTypeTextType: ConnectTypeText(type) },
          )

          /*类型：{ConnectTypeTextType}*/
        }
      </div>
    );
  }

  let clusterAndTenant = (
    <div>
      {
        formatMessage({
          id: 'odc.components.Header.ConnectionPopover.ClusterTenant',
          defaultMessage: '集群/租户：',
        })

        /*集群/租户：*/
      }
      {connection?.clusterName || '- '}/{connection?.tenantName || ' -'}
    </div>
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{
        lineHeight: '20px',
      }}
    >
      <Space direction="vertical">
        <Tooltip title={connection.name}>
          <div
            style={{
              marginBottom: 4,
              fontFamily: 'PingFangSC-Semibold',
              color: 'var(--text-color-primary)',
              fontWeight: 'bold',
              maxWidth: '240px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RiskLevelLabel
                content={connection?.environmentName}
                color={connection?.environmentStyle?.toLowerCase()}
              />
              <Icon
                component={DBIcon?.component}
                style={{ fontSize: 22, marginRight: 4, color: DBIcon?.color }}
              />{' '}
              {connection.name}
            </div>
          </div>
        </Tooltip>
        <div>
          {formatMessage(
            {
              id: 'src.component.Task.component.AsyncTaskOperationButton.6F09468F',
              defaultMessage: '数据源: {LogicalExpression0}',
            },
            { LogicalExpression0: database.dataSource?.name ?? '-' },
          )}
        </div>
        <div>
          {formatMessage(
            {
              id: 'src.component.Task.component.AsyncTaskOperationButton.E5F6F70E',
              defaultMessage: '项目: {LogicalExpression0}',
            },
            { LogicalExpression0: database.project?.name ?? '-' },
          )}
        </div>
        {renderConnectionMode()}
        <div>
          {
            formatMessage({
              id: 'odc.components.Header.ConnectionPopover.HostnamePort',
              defaultMessage: '主机名/端口：',
            })

            /*主机名/端口：*/
          }
          {connection.host}:{connection.port}
        </div>
        {clusterAndTenant}
        {
          formatMessage(
            {
              id: 'odc.components.Header.ConnectionPopover.DatabaseUsernameConnectiondbuser',
              defaultMessage: '数据库用户名：{connectionDbUser}',
            },

            { connectionDbUser: connection.username ?? '-' },
          )

          /*数据库用户名：{connectionDbUser}*/
        }
      </Space>
    </div>
  );
};
export const getExportConfig: (
  datasource,
) => Omit<IAsyncTaskOperationConfig, 'onReload' | 'dataSource'> = (datasource) => {
  return {
    asyncTaskType: AsyncTaskType.export,
    buttonText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.AE76486C',
      defaultMessage: '批量导出',
    }),
    buttonDisabledText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.5E0B7769',
      defaultMessage: '正在导出中',
    }),
    buttonType: 'default',
    modalTitle: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.1E0A444D',
      defaultMessage: '导出定时任务',
    }),
    modalExtra: (count: number, ids: number[]) => {
      return (
        <Space>
          {formatMessage(
            {
              id: 'src.component.Task.component.AsyncTaskOperationButton.338EDB81',
              defaultMessage: '存在 {count} 个定时任务',
            },
            { count },
          )}
          {ids?.length > 0 && (
            // id为 ${ids?.join(',')} 的任务依赖的数据库已失效, 无法导出
            <Tooltip
              title={`The databases relied on by tasks with IDs ${ids?.join(
                ',',
              )} have expired and cannot be exported.`}
            >
              <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />
            </Tooltip>
          )}
        </Space>
      );
    },
    columns: [
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.B5FC6045',
          defaultMessage: '任务编号',
        }),
        dataIndex: 'id',
        width: 80,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.F5FF3019',
          defaultMessage: '类型',
        }),
        dataIndex: 'type',
        render: (taskType: TaskType, record: ISwitchOdcTaskListResponse) =>
          scheduleTaskStatusMap[taskType || record.scheduleType] ||
          TaskTypeMap[taskType || record.scheduleType],
        width: 80,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.622F2E61',
          defaultMessage: '数据库',
        }),
        dataIndex: 'database',
        width: 100,
        ellipsis: true,
        render: (_: IDatabase, record: ScheduleExportListView) => {
          if (!_) {
            return '-';
          }
          return (
            <Space size={2}>
              <DataBaseStatusIcon item={_} />
              <Popover
                placement="left"
                content={<DatabasePopover connection={_?.dataSource} database={_} />}
              >
                <Typography.Text ellipsis style={{ maxWidth: 80 }}>
                  {_?.name}
                </Typography.Text>
              </Popover>
            </Space>
          );
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.05C15FB6',
          defaultMessage: '任务描述',
        }),
        dataIndex: 'description',
        width: 240,
        ellipsis: true,
        render: (description: string) => (
          <Tooltip placement="topLeft" title={description}>
            {description}
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.FF45B99C',
          defaultMessage: '创建人',
        }),
        dataIndex: 'creator',
        render: (creator) => (
          <Tooltip title={creator?.accountName} placement="topLeft">
            {creator?.accountName}
          </Tooltip>
        ),

        ellipsis: true,
        width: 100,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.3FAAC004',
          defaultMessage: '创建时间',
        }),
        dataIndex: 'createTime',
        render: (createTime: number) => getLocalFormatDateTime(createTime),
        width: 180,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.BD33AB81',
          defaultMessage: '状态',
        }),
        dataIndex: 'scheduleStatus',
        render: (status: keyof typeof TaskStatusMap) => {
          return (
            <Space size={8}>
              {TaskStatusMap[status]?.icon || scheduleTaskStatusMap[status]?.icon}
              {TaskStatusMap[status]?.text || scheduleTaskStatusMap[status]?.text}
            </Space>
          );
        },
      },
    ],

    confirmButtonText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.2CE7ECCB',
      defaultMessage: '全部导出',
    }),
    confirmButtonType: 'primary',
    needRiskConfirm: false,
    needSelectSpace: false,
    checkStatus: checkIsScheduleTaskListCanBeExported,
    checkStatusFailed: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.2514031D',
      defaultMessage: '请选择正常调度的定时任务，包括已创建、已启用、已禁用',
    }),
  };
};

export const getTerminateConfig: (
  datasource,
) => Omit<IAsyncTaskOperationConfig, 'onReload' | 'dataSource'> = (datasource) => {
  return {
    asyncTaskType: [
      TaskType.SQL_PLAN,
      TaskType.PARTITION_PLAN,
      TaskType.DATA_ARCHIVE,
      TaskType.DATA_DELETE,
    ]?.includes(datasource?.[0]?.type)
      ? AsyncTaskType.terminateSchedule
      : AsyncTaskType.terminateTask,
    buttonText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.40C6378F',
      defaultMessage: '批量终止',
    }),
    buttonDisabledText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.5167EE77',
      defaultMessage: '正在终止中',
    }),
    buttonType: 'default',
    modalTitle: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.C9E99128',
      defaultMessage: '终止任务',
    }),
    modalExtra: (count: number) =>
      formatMessage(
        {
          id: 'src.component.Task.component.AsyncTaskOperationButton.FD9548C1',
          defaultMessage:
            '存在 {count} 个正常运行或调度的任务。定时任务相关运行中的执行记录也将被终止。',
        },
        { count },
      ),

    columns: [
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.D3E6AED8',
          defaultMessage: '任务编号',
        }),
        dataIndex: 'id',
        width: 80,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.92F28FAE',
          defaultMessage: '类型',
        }),
        dataIndex: 'type',
        render: (taskType: TaskType, record: ISwitchOdcTaskListResponse) =>
          scheduleTaskStatusMap[taskType || record.scheduleType] ||
          TaskTypeMap[taskType || record.scheduleType],
        width: 80,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.352B9471',
          defaultMessage: '数据库',
        }),
        dataIndex: 'database',
        width: 100,
        ellipsis: true,
        render: (_: IDatabase, record: ScheduleExportListView) => {
          return (
            <Space size={2}>
              <DataBaseStatusIcon item={_} />
              <Popover
                placement="left"
                content={<DatabasePopover connection={_?.dataSource} database={_} />}
              >
                <Typography.Text ellipsis style={{ maxWidth: 80 }}>
                  {_?.name}
                </Typography.Text>
              </Popover>
            </Space>
          );
        },
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.F49C69F4',
          defaultMessage: '任务描述',
        }),
        dataIndex: 'description',
        width: 240,
        ellipsis: true,
        render: (description: string) => (
          <Tooltip placement="topLeft" title={description}>
            {description}
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.3417196E',
          defaultMessage: '创建人',
        }),
        dataIndex: 'creator',
        render: (creator) => (
          <Tooltip title={creator?.accountName} placement="topLeft">
            {creator?.accountName}
          </Tooltip>
        ),

        ellipsis: true,
        width: 100,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.42A0D1F4',
          defaultMessage: '创建时间',
        }),
        dataIndex: 'createTime',
        render: (createTime: number) => getLocalFormatDateTime(createTime),
        width: 180,
      },
      {
        title: formatMessage({
          id: 'src.component.Task.component.AsyncTaskOperationButton.F291E03C',
          defaultMessage: '状态',
        }),
        dataIndex: 'scheduleStatus',
        render: (status: keyof typeof TaskStatusMap) => {
          console.log(status);
          return (
            <Space size={8}>
              {TaskStatusMap[status]?.icon || scheduleTaskStatusMap[status]?.icon}
              {TaskStatusMap[status]?.text || scheduleTaskStatusMap[status]?.text}
            </Space>
          );
        },
      },
    ],

    confirmButtonText: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.EB21709F',
      defaultMessage: '终止全部',
    }),
    confirmButtonType: 'danger',
    needRiskConfirm: true,
    needSelectSpace: false,
    checkStatus: checkIsTaskListCanBeTerminated,
    checkStatusFailed: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.E5D14CDC',
      defaultMessage:
        '请选择运行中的任务（包括待执行、排队中、执行中）和正常调度的定时任务（包括已创建、已启用、已禁用）',
    }),
  };
};

// 是否为导出任务支持的周期任务
export const isScheduleMigrateTask = (taskType: TaskType) => {
  return [
    TaskType.DATA_ARCHIVE,
    TaskType.DATA_DELETE,
    TaskType.PARTITION_PLAN,
    TaskType.SQL_PLAN,
  ]?.includes(taskType);
};

// 是否是在正常调度状态的任务(已创建, 已启用, 已禁用)
export const checkIsScheduleTaskListCanBeExported = (taskStatus: TaskStatus) => {
  return statusThatCanBeExport?.includes(taskStatus);
};

// 是否是能终止的任务状态
export const checkIsTaskListCanBeTerminated = (taskStatus: TaskStatus) => {
  return statusThatCanBeTerminate?.includes(taskStatus);
};

/**
 * 从 URL 中提取 filename 参数的值
 * @param {string} url - 完整的 URL 字符串
 * @returns {string|null} - 返回 filename 的值，如果未找到则返回 null
 */
export function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const disposition = urlObj.searchParams.get('response-content-disposition');
    if (disposition) {
      const match = disposition.match(/filename=(.+?)(;|$)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  } catch (error) {
    console.error('extract file name error', error);
  }

  return null;
}

export const getCloudProviderName = function (cp: CloudProvider) {
  const map = {
    [CloudProvider.ALIYUN]: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.F22128E5',
      defaultMessage: '阿里云',
    }),
    [CloudProvider.AWSCN]: 'AWS',
    [CloudProvider.HUAWEI]: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.80E3419D',
      defaultMessage: '华为云',
    }),
    [CloudProvider.QCLOUD]: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.94C59288',
      defaultMessage: '腾讯云',
    }),
    [CloudProvider.TENCENT]: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.15EF749A',
      defaultMessage: '腾讯云',
    }),
    [CloudProvider.GOOGLE]: formatMessage({
      id: 'src.component.Task.component.AsyncTaskOperationButton.34A2AF15',
      defaultMessage: '谷歌云',
    }),
    [CloudProvider.AWS]: 'AWS',
  };
  return map[cp] || '';
};
