import {
  batchDeleteTaskFlow,
  deleteTaskFlow,
  getTaskFlowDetail,
  getTaskFlowList,
  setTaskFlowEnable,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, systemUpdatePermissions } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import UserPopover from '@/component/UserPopover';
import type { IResponseData } from '@/d.ts';
import {
  IManagerDetailTabs,
  IManagerResourceType,
  TaskPageType,
  TaskSubType,
  TaskType,
} from '@/d.ts';
import { ManageContext } from '@/page/Manage/context';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, message, Modal, Space } from 'antd';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import type { ITaskFlowConfig } from '../../interface';
import CommonDetailModal from '../CommonDetailModal';
import Status from '../CommonStatus';
import FormTaskModal from '../FormTaskModal';
import TaskOrderModal, { TaskRadio } from '../TaskOrderModal';
import { RecordContent, TaskLabel } from './component';
import styles from './index.less';

interface IProps {}
interface IState {
  detailId: number;
  currentTaskFlow: ITaskFlowConfig;
  editId: number;
  isCopy: boolean;
  taskType: TaskPageType;
  formModalVisible: boolean;
  taskFlows: IResponseData<ITaskFlowConfig>;
  detailModalVisible: boolean;
  orderModalVisible: boolean;
}

// 330版本不支持 批量删除
const enabled_rowSelecter = true;

export function hour2Seconds(args: number) {
  return args * 60 * 60;
}

export function seconds2Hour(args: number) {
  return args / 60 / 60;
}

enum OperationType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COPY = 'COPY',
  DELETE = 'DELETE',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

export const TaskTypeMap = {
  [TaskType.IMPORT]: formatMessage({
    id: 'odc.components.TaskFlowPage.Import',
  }),

  //导入
  [TaskType.EXPORT]: formatMessage({
    id: 'odc.components.TaskFlowPage.Export',
  }),

  //导出
  [TaskType.DATAMOCK]: formatMessage({
    id: 'odc.components.TaskFlowPage.AnalogData',
  }),

  //模拟数据
  [TaskType.ASYNC]: formatMessage({
    id: 'odc.components.TaskFlowPage.DatabaseChanges',
  }),

  //数据库变更
  [TaskType.PARTITION_PLAN]: formatMessage({
    id: 'odc.components.TaskFlowPage.PartitionPlan',
  }),
  //分区计划
  [TaskType.PERMISSION_APPLY]: formatMessage({
    id: 'odc.components.TaskFlowPage.ApplyForConnectionPermissions',
  }),

  //申请连接权限
  [TaskType.SHADOW]: formatMessage({
    id: 'odc.components.TaskFlowPage.ShadowTable',
  }),
  //影子表

  [TaskType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.components.TaskFlowPage.PlannedChange',
  }), //计划变更
};

export const TaskSubTypeMap = {
  [TaskSubType.UPDATE]: 'Update',
  [TaskSubType.DELETE]: 'Delete',
  [TaskSubType.INSERT]: 'Insert',
  [TaskSubType.SELECT]: 'Select',
  [TaskSubType.CREATE]: 'Create',
  [TaskSubType.DROP]: 'Drop',
  [TaskSubType.ALTER]: 'Alter',
  [TaskSubType.OTHER]: formatMessage({
    id: 'odc.components.TaskFlowPage.Others',
  }),

  //其他
};

class TaskFlowPage extends React.PureComponent<IProps, IState> {
  static contextType = ManageContext;

  private tableRef = React.createRef<ITableInstance>();

  private getColumns = (canAcessDelete: boolean) => {
    return [
      {
        title: formatMessage({
          id: 'odc.components.TaskFlowPage.TaskFlowName',
        }), //任务流程名称
        ellipsis: true,
        fixed: 'left' as FixedType,
        key: 'name',
        dataIndex: 'name',
        filterDropdown: (props) => {
          return (
            <SearchFilter
              {...props}
              placeholder={formatMessage({
                id: 'odc.components.TaskFlowPage.EnterAProcessName',
              })}

              /*请输入流程名称*/
            />
          );
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
        ),

        filters: [],
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.TaskType' }), //任务类型
        width: 240,
        ellipsis: true,
        key: 'taskType',
        dataIndex: 'taskType',
        render: (taskType, record) => <TaskLabel type={taskType} subTypes={record?.subTypes} />,
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.RiskLevels' }), //风险等级数
        width: 120,
        ellipsis: true,
        key: 'riskLevelConfigs',
        dataIndex: 'riskLevelConfigs',
        render: (riskLevelConfigs) => {
          return riskLevelConfigs?.length
            ? formatMessage(
                {
                  id: 'odc.components.TaskFlowPage.Risklevelconfigslength',
                },

                { riskLevelConfigsLength: riskLevelConfigs.length },
              )
            : //`${riskLevelConfigs.length} 级`
              '-';
        },
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.Created' }), //创建人
        width: 120,
        ellipsis: true,
        key: 'creator',
        dataIndex: 'creator',
        filterDropdown: (props) => {
          return (
            <SearchFilter
              {...props}
              placeholder={formatMessage({
                id: 'odc.components.TaskFlowPage.EnterTheCreator',
              })}

              /*请输入创建人*/
            />
          );
        },
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
        ),

        filters: [],
        render: (creator) => {
          return (
            <UserPopover
              name={creator?.name}
              accountName={creator?.accountName}
              roles={creator?.roleNames}
            />
          );
        },
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.Status' }), //状态
        width: 100,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({ id: 'odc.components.TaskFlowPage.Enable' }), //启用
            value: true,
          },

          {
            text: formatMessage({ id: 'odc.components.TaskFlowPage.Disable' }), //停用
            value: false,
          },
        ],

        render: (enabled) => <Status enabled={enabled} />,
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.Created.1' }), //创建时间
        width: 190,
        ellipsis: true,
        key: 'createTime',
        dataIndex: 'createTime',
        sorter: true,
        render: (createTime) => getLocalFormatDateTime(createTime),
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.Actions' }), //操作
        width: 120,
        fixed: 'right' as FixedType,
        key: 'action',
        render: (value, record) => {
          return (
            <Action.Group size={2}>
              <Action.Link
                onClick={async () => {
                  this.handleTask(record.id, OperationType.VIEW, record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.TaskFlowPage.View',
                  })

                  /*查看*/
                }
              </Action.Link>
              <Acess {...systemUpdatePermissions[IManagerResourceType.flow_config]}>
                <Action.Group size={1}>
                  <Action.Link
                    onClick={async () => {
                      this.handleTask(record.id, OperationType.EDIT);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.TaskFlowPage.Edit',
                      })

                      /*编辑*/
                    }
                  </Action.Link>
                  <Action.Link
                    visible={!record.builtIn}
                    onClick={async () => {
                      this.handleTask(record.id, OperationType.COPY);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.TaskFlowPage.Copy',
                      })

                      /*复制*/
                    }
                  </Action.Link>
                  <Action.Link
                    onClick={async () => {
                      this.handleTask(
                        record.id,
                        record.enabled ? OperationType.DISABLE : OperationType.ENABLE,
                      );
                    }}
                  >
                    {
                      record.enabled
                        ? formatMessage({
                            id: 'odc.components.TaskFlowPage.Disable',
                          })
                        : //停用
                          formatMessage({
                            id: 'odc.components.TaskFlowPage.Enable',
                          })

                      //启用
                    }
                  </Action.Link>
                  {canAcessDelete && (
                    <Action.Link
                      visible={!record.builtIn}
                      onClick={async () => {
                        this.handleTask(record.id, OperationType.DELETE);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.components.TaskFlowPage.Delete',
                        })

                        /*删除*/
                      }
                    </Action.Link>
                  )}
                </Action.Group>
              </Acess>
            </Action.Group>
          );
        },
      },
    ];

    return;
  };

  private table = null;

  readonly state = {
    detailId: null,
    currentTaskFlow: null,
    editId: null,
    isCopy: false,
    taskType: TaskPageType.IMPORT,
    formModalVisible: false,
    taskFlows: null,
    detailModalVisible: false,
    orderModalVisible: false,
  };

  private openFormModal = (editId: number = null, isCopy: boolean = false) => {
    this.setState({
      formModalVisible: true,
      editId,
      isCopy,
    });
  };

  private openDetailModal = (taskflow: ITaskFlowConfig) => {
    this.setState({
      detailModalVisible: true,
      detailId: taskflow.id,
      currentTaskFlow: taskflow,
    });
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private openOrderModal = () => {
    this.setState({
      orderModalVisible: true,
    });
  };

  private handleCloseOrderModal = () => {
    this.setState({
      orderModalVisible: false,
    });
  };

  private handleTask = (id: number, key: OperationType, taskFlow?: ITaskFlowConfig) => {
    switch (key) {
      case OperationType.COPY:
        this.openFormModal(id, true);
        break;
      case OperationType.DELETE:
        this.handleDelete(id);
        break;
      case OperationType.EDIT:
        this.openFormModal(id);
        break;
      case OperationType.VIEW:
        this.openDetailModal(taskFlow);
        break;
      case OperationType.ENABLE:
        this.handleStatusChange(id, true);
        break;
      case OperationType.DISABLE:
        this.handleStatusChange(id, false);
        break;
      default:
    }
  };

  private handleStatusChange = (id: number, enabled: boolean, callback = () => {}) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.TaskFlowPage.AreYouSureYouWant.2',
        }),

        //确定要停用流程吗？
        content: formatMessage({
          id: 'odc.components.TaskFlowPage.AfterYouDisableTheTask',
        }),

        //停用该任务流程后，将不能发起相关任务审批
        cancelText: formatMessage({ id: 'odc.components.TaskFlowPage.Cancel' }), //取消
        okText: formatMessage({ id: 'odc.components.TaskFlowPage.Ok' }), //确定
        centered: true,
        onOk: () => {
          if (id) {
            this.handleResourceGroupEnable(id, enabled);
          }
        },
        onCancel: callback,
      });
    } else {
      this.handleResourceGroupEnable(id, enabled);
    }
  };

  private handleResourceGroupEnable = async (id: number, enabled: boolean) => {
    const res = await setTaskFlowEnable({
      id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.TaskFlowPage.Enabled' }) //启用成功
          : formatMessage({ id: 'odc.components.TaskFlowPage.Disabled' }), //停用成功
      );
      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({ id: 'odc.components.TaskFlowPage.FailedToEnable' }) //启用失败
          : formatMessage({ id: 'odc.components.TaskFlowPage.Disabled.1' }), //停用失败
      );
    }
  };

  private handleConfirmDelete = async (id: number) => {
    const res = await deleteTaskFlow(id);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.TaskFlowPage.Deleted' }), //删除成功
      );
      this.reloadData();
    } else {
      Modal.error({
        title: formatMessage({
          id: 'odc.components.TaskFlowPage.UnableToDeleteTheTask',
        }),

        //删除任务流程失败
        content: formatMessage({
          id: 'odc.components.TaskFlowPage.AnUnfinishedTaskExistsIn',
        }),

        //当前任务流程中存在未完成的任务，暂不允许删除
        okText: formatMessage({ id: 'odc.components.TaskFlowPage.ISee' }), //我知道了
        centered: true,
      });
    }
  };

  private handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.TaskFlowPage.AreYouSureYouWant.1',
      }),

      //确定要删除流程吗？
      icon: <ExclamationCircleFilled style={{ color: '#faad14' }} />,
      content: formatMessage({
        id: 'odc.components.TaskFlowPage.AfterTheTaskProcessIs',
      }),

      //删除该任务流程后，将不能发起相关任务审批流程，且无法恢复
      cancelText: formatMessage({ id: 'odc.components.TaskFlowPage.Cancel' }), //取消
      okText: formatMessage({ id: 'odc.components.TaskFlowPage.Ok' }), //确定
      okType: 'danger',
      centered: true,
      onOk: () => {
        if (Array.isArray(param)) {
          this.handleConfirmBatchDelete(param as number[]);
        } else {
          this.handleConfirmDelete(param as number);
        }
      },
    });
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { creator, enabled, name } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const { taskType } = this.state;
    const data = {
      name,
      taskType,
      creatorName: creator,
      enabled,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // enabled filter
    data.enabled = enabled?.length === 1 ? enabled : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const taskFlows = await getTaskFlowList(data);
    this.setState({
      taskFlows,
    });
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private handleTableChange = (args: ITableLoadOptions) => {
    this.loadData(args);
  };

  private handleConfirmBatchDelete = async (ids: number[]) => {
    const res = await batchDeleteTaskFlow(ids);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.TaskFlowPage.Deleted' }), //删除成功
      );
      this.reloadData();
      this.tableRef.current.resetSelectedRows();
    } else {
      Modal.error({
        title: formatMessage({
          id: 'odc.components.TaskFlowPage.UnableToDeleteTheTask',
        }),

        //删除任务流程失败
        content: formatMessage({
          id: 'odc.components.TaskFlowPage.AnUnfinishedTaskExistsIn',
        }),

        //当前任务流程中存在未完成的任务，暂不允许删除
        okText: formatMessage({ id: 'odc.components.TaskFlowPage.ISee' }), //我知道了
        centered: true,
      });
    }
  };

  private getCheckboxProps = (record: ITaskFlowConfig) => {
    return {
      disabled: record?.builtIn,
    };
  };

  private handleTaskTypeChange = (value: TaskPageType) => {
    this.setState(
      {
        taskType: value,
      },

      () => {
        this.reloadData();
      },
    );
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  render() {
    const {
      detailModalVisible,
      orderModalVisible,
      formModalVisible,
      editId,
      isCopy,
      detailId,
      currentTaskFlow,
      taskFlows,
      taskType,
    } = this.state;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.flow_config,
      action: actionTypes.create,
    }).accessible;
    const canAcessUpdate = canAcess({
      resourceIdentifier: IManagerResourceType.flow_config,
      action: actionTypes.update,
    }).accessible;
    const canAcessDelete = canAcess({
      resourceIdentifier: IManagerResourceType.flow_config,
      action: actionTypes.delete,
    }).accessible;
    const columns = this.getColumns(canAcessDelete);
    const operationOptions = [];
    if (canAcessUpdate) {
      operationOptions.push({
        type: IOperationOptionType.button,
        icon: <SettingOutlined />,
        content: formatMessage({
          id: 'odc.components.TaskFlowPage.SetPriority',
        }),

        //设置优先级
        onClick: this.openOrderModal,
      });
    }
    if (canAcessCreate) {
      operationOptions.push({
        type: IOperationOptionType.button,
        content: formatMessage({
          id: 'odc.components.TaskFlowPage.CreateProcess',
        }),

        //新建流程
        isPrimary: true,
        disabled: taskType === TaskPageType.PARTITION_PLAN,
        onClick: this.handleCreate,
      });
    }
    return (
      <>
        <CommonTable
          ref={this.tableRef}
          titleContent={{
            title: formatMessage({
              id: 'odc.components.TaskFlowPage.TaskFlowManagement',
            }),

            //任务流程管理
          }}
          filterContent={{
            enabledSearch: false,
            filters: [
              {
                render: () => <TaskRadio value={taskType} onChange={this.handleTaskTypeChange} />,
              },
            ],
          }}
          operationContent={{
            options: operationOptions,
          }}
          rowSelecter={
            enabled_rowSelecter
              ? {
                  options: [
                    {
                      okText: formatMessage({
                        id: 'odc.components.TaskFlowPage.BatchDelete',
                      }),

                      //批量删除
                      onOk: this.handleDelete,
                    },
                  ],

                  getCheckboxProps: this.getCheckboxProps,
                }
              : null
          }
          onLoad={this.loadData}
          onChange={this.handleTableChange}
          tableProps={{
            columns: columns,
            dataSource: taskFlows?.contents,
            rowKey: 'id',
            pagination: {
              current: taskFlows?.page?.number,
              total: taskFlows?.page?.totalElements,
            },

            scroll: {
              x: 1000,
            },
          }}
        />

        <FormTaskModal
          defaultTaskType={taskType}
          editId={editId}
          isCopy={isCopy}
          visible={formModalVisible}
          reloadData={this.reloadData}
          handleStatusChange={this.handleStatusChange}
          openOrderModal={this.openOrderModal}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
          }}
        />

        <CommonDetailModal
          tabs={[
            {
              key: IManagerDetailTabs.DETAIL,
              title: formatMessage({
                id: 'odc.components.TaskFlowPage.ProcessInformation',
              }),

              //流程信息
            },
            {
              key: IManagerDetailTabs.RESOURCE,
              title: formatMessage({
                id: 'odc.components.TaskFlowPage.RelatedConnections',
              }),

              //相关连接
            },
          ]}
          visible={detailModalVisible}
          width={640}
          className={styles.detailContent}
          title={formatMessage({
            id: 'odc.components.TaskFlowPage.TaskFlowDetails',
          })}
          /*任务流程详情*/
          detailId={detailId}
          footer={
            <Space>
              {!currentTaskFlow?.builtIn && canAcessUpdate && (
                <Button
                  onClick={() => {
                    this.handleTask(currentTaskFlow.id, OperationType.COPY);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.TaskFlowPage.Copy',
                    })

                    /*复制*/
                  }
                </Button>
              )}

              {canAcessUpdate && (
                <Button
                  onClick={() => {
                    this.handleTask(currentTaskFlow.id, OperationType.EDIT);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.TaskFlowPage.Edit',
                    })

                    /*编辑*/
                  }
                </Button>
              )}

              <Button onClick={this.handleCloseDetailModal}>
                {
                  formatMessage({
                    id: 'odc.components.TaskFlowPage.Close',
                  })

                  /*关闭*/
                }
              </Button>
            </Space>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={getTaskFlowDetail}
          renderContent={(key, data) => <RecordContent activeKey={key} data={data} />}
        />

        <TaskOrderModal visible={orderModalVisible} onClose={this.handleCloseOrderModal} />
      </>
    );
  }
}

export default TaskFlowPage;
