import { getDataSourceStyleByConnectType } from '@/common/datasource';
import Action from '@/component/Action';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import StatusLabel from '@/component/Task/component/Status';
import { SubTaskStatus, TaskType, TaskStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon, { QuestionCircleOutlined } from '@ant-design/icons';
import { Popover, Space, Tooltip, Typography } from 'antd';
import { ProjectRole } from '@/d.ts/project';

const getColumns = (params: {
  handleDetailVisible: (id: number) => void;
  onSwapTable: (id: number) => void;
  handleProgressDetailVisible: (id: number) => void;
  taskStatus: TaskStatus;
  projectRoleList: ProjectRole[];
}) => {
  // 查看进度 提示文本
  const viewProgressTooltip = (
    <div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.BD5053CC',
          defaultMessage: 'ODC无锁结构变更功能包含如下步骤，步骤按照先后执行',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.D7170E72',
          defaultMessage: '1.创建影子表.该阶段为创建命名规则为 _$',
        })}
        {'{'}
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.5E1F4A52',
          defaultMessage: '原始表名',
        })}
        {'}'}
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.B2A83585',
          defaultMessage: '_osc_new_ 的影子表',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.9EB23593',
          defaultMessage:
            '2.创建数据迁移任务.该阶段为创建数据迁移服务.无锁结构变更依赖数据迁移服务进行原表到影子表的数据复制',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.E054491C',
          defaultMessage: '3.数据迁移任务预检查.该阶段为数据迁移服务检查用户数据库是否满足迁移条件',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.A0022050',
          defaultMessage: '4.数据迁移任务迁移全量数据. 该阶段为数据迁移服务复制静态数据到影子表',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.0E8BD1DF',
          defaultMessage: '5.数据迁移服务补齐增量数据.该阶段为数据迁移服务应用增量变更数据到影子表',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.FA8BFF19',
          defaultMessage:
            '6.切换表结构.该阶段为表切换阶段，在保证数据一致的前提下，原表重命名到 _$',
        })}
        {'{'}
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.BE01B8C6',
          defaultMessage: '原始表名',
        })}
        {'}'}
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.CFC86411',
          defaultMessage: '_osc_old_, 影子表重命名为原表',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.D35FDAA6',
          defaultMessage: '7.释放数据迁移任务资源.该阶段为释放数据迁移服务的相关资源',
        })}
      </div>
    </div>
  );
  const isProjectDBAorOwner = () => {
    return params.projectRoleList?.some((item) =>
      [ProjectRole.DBA, ProjectRole.OWNER].includes(item),
    );
  };
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
      width: 150,
      render: (_, record) => {
        const { status } = record;
        const resultJson = JSON.parse(record?.resultJson);
        const isTaskExecuting = [TaskStatus.EXECUTING]?.includes(params.taskStatus);
        return (
          <Space>
            <Action.Link
              onClick={async () => {
                params?.handleDetailVisible(record?.id);
              }}
            >
              {formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.TaskProgress.1AA009D5',
                defaultMessage: '查看结构',
              })}
            </Action.Link>
            {resultJson?.manualSwapTableEnabled && isTaskExecuting && isProjectDBAorOwner && (
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
            {/* 进行中和异常状态可查看进度 */}
            {[SubTaskStatus.RUNNING, SubTaskStatus.ABNORMAL].includes(status) && (
              <Space size={2}>
                <Action.Link
                  onClick={async () => {
                    params?.handleProgressDetailVisible(record?.id);
                  }}
                >
                  {formatMessage({
                    id: 'src.component.Task.component.CommonDetailModal.TaskProgress.D1ECE614',
                    defaultMessage: '查看进度',
                  })}
                </Action.Link>
                <Tooltip placement={'bottomRight'} title={viewProgressTooltip}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            )}
          </Space>
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
    handleProgressDetailVisible;
  },
  status: TaskStatus,
  projectRole: ProjectRole[],
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
        handleProgressDetailVisible: params?.handleProgressDetailVisible,
        taskStatus: status,
        projectRoleList: projectRole,
      });
    }
  }
};
