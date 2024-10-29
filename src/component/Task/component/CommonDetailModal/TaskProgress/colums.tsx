import { getDataSourceStyleByConnectType } from '@/common/datasource';
import Action from '@/component/Action';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import StatusLabel from '@/component/Task/component/Status';
import { TaskStatus, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon from '@ant-design/icons';
import { Popover, Space, Typography } from 'antd';

const { Link } = Typography;

const getColumns = (params: {
  handleDetailVisible: (id: number) => void;
  onSwapTable: (id: number) => void;
  taskStatus: TaskStatus;
}) => {
  return [
    {
      dataIndex: 'resultJson',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.SourceTable',
      }),
      //源表
      ellipsis: true,
      render: (resultJson) => {
        return <span>{JSON.parse(resultJson ?? '{}')?.originTableName}</span>;
      },
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.ExecutionStatus',
      }),
      //执行状态
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return (
          <StatusLabel isSubTask status={status} progress={Math.floor(record.progressPercentage)} />
        );
      },
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.Operation',
      }),
      //操作
      ellipsis: true,
      width: 120,
      render: (_, record) => {
        const resultJson = JSON.parse(record?.resultJson);
        const isTaskFailed = [TaskStatus.EXECUTING]?.includes(params.taskStatus);
        return (
          <>
            <Action.Link
              onClick={async () => {
                params?.handleDetailVisible(record?.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.CommonDetailModal.TaskProgress.View',
                }) /*查看*/
              }
            </Action.Link>
            {resultJson?.manualSwapTableEnabled && !isTaskFailed && (
              <Action.Link
                onClick={async () => {
                  params?.onSwapTable(record?.id);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.CommonDetailModal.WatchNameSwitch',
                  }) /* 
            表名切换
            */
                }
              </Action.Link>
            )}
          </>
        );
      },
    },
  ];
};
const getMultipleAsyncColumns = (params: { handleMultipleAsyncOpen: (taskId: number) => void }) => {
  return [
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.FC1C254D',
        defaultMessage: '执行顺序',
      }),
      dataIndex: 'nodeIndex',
      width: 100,
      render: (nodeIndex) => nodeIndex + 1,
      onCell: (record, index) => {
        return {
          rowSpan: record?.needMerge ? record?.rowSpan : 0,
        };
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.9A136568',
        defaultMessage: '数据库',
      }),
      dataIndex: 'database',
      width: 200,
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const icon = getDataSourceStyleByConnectType(record?.database?.dataSource?.type);
        return (
          <Popover
            content={
              <Space size={0}>
                <RiskLevelLabel
                  content={record?.database?.environment?.name}
                  color={record?.database?.environment?.style}
                />

                <Space size={4}>
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <div>{record?.database?.name}</div>
                  <div style={{ color: 'var(--neutral-black45-color)' }}>
                    {record?.database?.dataSource?.name}
                  </div>
                </Space>
              </Space>
            }
          >
            <Space size={0}>
              <RiskLevelLabel
                content={record?.database?.environment?.name}
                color={record?.database?.environment?.style}
              />

              <Space size={4}>
                <Icon
                  component={icon?.icon?.component}
                  style={{
                    color: icon?.icon?.color,
                    fontSize: 16,
                    marginRight: 4,
                  }}
                />

                <div>{record?.database?.name}</div>
                <div style={{ color: 'var(--neutral-black45-color)' }}>
                  {record?.database?.dataSource?.name}
                </div>
              </Space>
            </Space>
          </Popover>
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.0DAC1A06',
        defaultMessage: '开始时间',
      }),
      dataIndex: 'createTime',
      width: 178,
      render: (_, record) => (
        <div>
          {record?.flowInstanceDetailResp?.createTime
            ? getLocalFormatDateTime(record?.flowInstanceDetailResp?.createTime)
            : '-'}
        </div>
      ),
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.B46A5216',
        defaultMessage: '执行状态',
      }),
      ellipsis: true,
      width: 120,
      render: (status, record) => {
        return (
          <StatusLabel
            status={record?.status}
            progress={Math.floor(record?.flowInstanceDetailResp?.progressPercentage)}
          />
        );
      },
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.1DB56DDA',
        defaultMessage: '操作',
      }),
      ellipsis: true,
      width: 90,
      render: (_, record) => {
        return (
          <>
            <Action.Link
              disabled={!record?.flowInstanceDetailResp}
              onClick={async () => {
                params?.handleMultipleAsyncOpen(record?.flowInstanceDetailResp?.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.CommonDetailModal.TaskProgress.View',
                }) /*查看*/
              }
            </Action.Link>
          </>
        );
      },
    },
  ];
};

export const getColumnsByTaskType = (
  type: TaskType,
  params: {
    handleDetailVisible;
    handleSwapTable;
    handleMultipleAsyncOpen;
  },
  status: TaskStatus,
) => {
  switch (type) {
    case TaskType.MULTIPLE_ASYNC: {
      return getMultipleAsyncColumns({
        handleMultipleAsyncOpen: params?.handleMultipleAsyncOpen,
      });
    }
    case TaskType.ONLINE_SCHEMA_CHANGE: {
      return getColumns({
        handleDetailVisible: params?.handleDetailVisible,
        onSwapTable: params?.handleSwapTable,
        taskStatus: status,
      });
    }
  }
};
