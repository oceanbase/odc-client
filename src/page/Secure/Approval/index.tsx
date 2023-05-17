import {
  actionTypes,
  ConnectionMode,
  IManagePagesKeys,
  IManagerDetailTabs,
  IManagerPublicConnection,
  IManagerResourceGroup,
  IManagerResourceType,
  IManagerRole,
  IManagerUser,
  IManageUserListParams,
  IResponseData,
  TaskPageType,
} from '@/d.ts';
import { SchemaStore } from '@/store/schema';
import { SettingStore } from '@/store/setting';
import { TaskStore } from '@/store/task';

import {
  batchDeleteTaskFlow,
  deleteTaskFlow,
  getPublicConnectionList,
  getResourceGroupList,
  getRoleList,
  getTaskFlowDetail,
  getTaskFlowList,
  getUserList,
  setTaskFlowEnable,
} from '@/common/network/manager';
import { ModalStore } from '@/store/modal';
import { formatMessage, useLocation } from '@umijs/max';
import { Button, message, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';

import Sider from './Sider';

import { Acess, canAcess, systemUpdatePermissions } from '@/component/Acess';
import {
  FixedType,
  IOperationOptionType,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import CommonDetailModal from '@/page/Manage/components/CommonDetailModal';
import FormTaskModal from '@/page/Manage/components/FormTaskModal';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
// import { RecordContent, Status } from "@/page/Manage/components/RecordPage/component";
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import SearchFilter from '@/component/SearchFilter';
import UserPopover from '@/component/UserPopover';
import Status from '@/page/Manage/components/CommonStatus';
import { RecordContent, TaskLabel } from '@/page/Manage/components/TaskFlowPage/component';
import TaskOrderModal from '@/page/Manage/components/TaskOrderModal';
import { ManageContext } from '@/page/Manage/context';
import { ITaskFlowConfig } from '@/page/Manage/interface';
import { UserStore } from '@/store/login';
import LocalCommonTable from './CommonTable';

enum OperationType {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COPY = 'COPY',
  DELETE = 'DELETE',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}
enum TaskPageTypeMap {
  ALL = '',
  IMPORT = '导入',
  EXPORT = '导出',
  MOCKDATA = '模拟数据',
  ASYNC = '数据库变更',
  PERMISSION_APPLY = '权限申请',
  PARTITION_PLAN = '分区计划',
  SQL_PLAN = 'SQL 计划',
  DATASAVE = '数据归档',
  SHADOWTABLE_SYNC = '影子表同步',
  CREATED_BY_CURRENT_USER = 'createdByCurrentUser',
  APPROVE_BY_CURRENT_USER = 'approveByCurrentUser',
  ALTER_SCHEDULE = 'ALTER_SCHEDULE',
}
interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  schemaStore?: SchemaStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
}
interface IApprovalState {
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
const Approval: React.FC<IProps> = ({
  userStore,
  settingStore,
  schemaStore,
  taskStore,
  modalStore,
}) => {
  const tableRef = useRef(null);

  const [detailId, setDetailId] = useState<number>(null);
  const [currentTaskFlow, setCurrentTaskFlow] = useState<ITaskFlowConfig>(null);
  const [editId, setEditId] = useState<number>(null);
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const [taskType, setTaskType] = useState<TaskPageType>(TaskPageType.ALL);
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [taskFlows, setTaskFlows] = useState<IResponseData<ITaskFlowConfig>>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [orderModalVisible, setOrderModalVisible] = useState<boolean>(false);

  const openFormModal = (editId: number = null, isCopy: boolean = false) => {
    setFormModalVisible(true);
    setEditId(editId);
    setIsCopy(isCopy);
  };

  const handleCreate = () => {
    openFormModal();
  };

  const getColumns = (canAcessDelete: boolean) => {
    return [
      {
        title: formatMessage({
          id: 'odc.components.TaskFlowPage.TaskFlowName',
        }), //任务流程名称
        ellipsis: true,
        fixed: 'left' as FixedType,
        key: 'name',
        width: 313,
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
        width: 160,
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
        width: 80,
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
        width: 160,
        ellipsis: true,
        key: 'createTime',
        dataIndex: 'createTime',
        sorter: true,
        render: (createTime) => getLocalFormatDateTime(createTime),
      },

      {
        title: formatMessage({ id: 'odc.components.TaskFlowPage.Actions' }), //操作
        width: 132,
        fixed: 'right' as FixedType,
        key: 'action',
        render: (value, record) => {
          return (
            <Action.Group size={2}>
              <Action.Link
                key={'view'}
                onClick={async () => {
                  handleTask(record.id, OperationType.VIEW, record);
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
                    key={'edit'}
                    onClick={async () => {
                      handleTask(record.id, OperationType.EDIT);
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
                    key={'copy'}
                    visible={!record.builtIn}
                    onClick={async () => {
                      handleTask(record.id, OperationType.COPY);
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
                    key={'able'}
                    onClick={async () => {
                      handleTask(
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
                      key={'delete'}
                      visible={!record.builtIn}
                      onClick={async () => {
                        handleTask(record.id, OperationType.DELETE);
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
  };
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
  const columns = getColumns(canAcessDelete);

  const operationOptions = [];
  if (canAcessCreate) {
    operationOptions.push({
      type: IOperationOptionType.button,
      content: formatMessage({
        id: 'odc.components.TaskFlowPage.CreateProcess',
      }),

      //新建流程
      isPrimary: true,
      disabled: taskType === TaskPageType.PARTITION_PLAN,
      onClick: handleCreate,
    });
  }

  const loadData = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    const { creator, enabled, name } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};

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
    const taskFlows = (await getTaskFlowList(data)) || null;
    setTaskFlows(taskFlows);
  };

  const handleTableChange = (args: ITableLoadOptions) => {
    loadData(args);
  };

  const reloadData = () => {
    tableRef.current.reload();
  };
  const handleResourceGroupEnable = async (id: number, enabled: boolean) => {
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
      reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({ id: 'odc.components.TaskFlowPage.FailedToEnable' }) //启用失败
          : formatMessage({ id: 'odc.components.TaskFlowPage.Disabled.1' }), //停用失败
      );
    }
  };

  const handleStatusChange = (id: number, enabled: boolean, callback = () => {}) => {
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
            handleResourceGroupEnable(id, enabled);
          }
        },
        onCancel: callback,
      });
    } else {
      handleResourceGroupEnable(id, enabled);
    }
  };

  const handleDelete = (param: React.Key | React.Key[]) => {
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
          handleConfirmBatchDelete(param as number[]);
        } else {
          handleConfirmDelete(param as number);
        }
      },
    });
  };
  const handleConfirmBatchDelete = async (ids: number[]) => {
    const res = await batchDeleteTaskFlow(ids);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.TaskFlowPage.Deleted' }), //删除成功
      );
      reloadData();
      tableRef.current.resetSelectedRows();
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
  const handleConfirmDelete = async (id: number) => {
    const res = await deleteTaskFlow(id);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.TaskFlowPage.Deleted' }), //删除成功
      );
      reloadData();
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
  const openDetailModal = (taskflow: ITaskFlowConfig) => {
    setDetailModalVisible(true);
    setDetailId(taskflow.id);
    setCurrentTaskFlow(taskflow);
  };
  const handleTask = (id: number, key: OperationType, taskFlow?: ITaskFlowConfig) => {
    switch (key) {
      case OperationType.COPY:
        openFormModal(id, true);
        break;
      case OperationType.DELETE:
        handleDelete(id);
        break;
      case OperationType.EDIT:
        openFormModal(id);
        break;
      case OperationType.VIEW:
        openDetailModal(taskFlow);
        break;
      case OperationType.ENABLE:
        handleStatusChange(id, true);
        break;
      case OperationType.DISABLE:
        handleStatusChange(id, false);
        break;
      default:
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const openOrderModal = () => {
    setOrderModalVisible(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalVisible(false);
  };

  const handleTaskTypeChange = (value: TaskPageType) => {
    setTaskType(value);
  };
  useEffect(() => {
    reloadData();
  }, [taskType]);

  const { pathname } = useLocation();
  const pathnameArray = pathname.split('/');
  const lastPathname = pathnameArray?.[-1] || pathnameArray[pathnameArray.length - 1];
  const initActiveKey = lastPathname as IManagePagesKeys;
  const [openKeys, setOpenKeys] = useState<string[]>(
    [IManagePagesKeys.CONNECTION, IManagePagesKeys.RESOURCE].includes(initActiveKey)
      ? [IManagePagesKeys.PUBLIC_RESOURCE_MANAGE]
      : [IManagePagesKeys.MEMBER_MANAGE],
  );
  const [activeKey, setActivekey] = useState<IManagePagesKeys>(
    initActiveKey ? initActiveKey : IManagePagesKeys.USER,
  );
  const [users, setUsers] = useState<IResponseData<IManagerUser>>(null);
  const [roles, setRoles] = useState<Map<number, IManagerRole>>(new Map());
  const [publicConnections, setPublicConnections] =
    useState<IResponseData<IManagerPublicConnection>>(null);
  const [resourceGroups, setResourceGroups] = useState<IResponseData<IManagerResourceGroup>>(null);

  const _getUserList = async (params: IManageUserListParams) => {
    const users = await getUserList(params);
    setUsers(users);
  };

  const _getRoleList = async (params?: IManageUserListParams) => {
    const data = await getRoleList(params);
    const roles: [number, IManagerRole][] = data?.contents?.map((item) => [item.id, item]);
    setRoles(new Map(roles));
  };

  const _updateRoleById = async (data: IManagerRole) => {
    const newRoles = new Map(roles);
    newRoles.set(data.id, data);
    setRoles(newRoles);
  };

  const _getPublicConnectionList = async (params?: {
    name?: string;
    enabled?: boolean[];
    dialectType?: ConnectionMode[];
    resourceGroupId?: number[];
  }) => {
    const publicConnections = await getPublicConnectionList(params);
    setPublicConnections(publicConnections);
  };

  const _getResourceGroupList = async () => {
    const resourceGroups = await getResourceGroupList();
    setResourceGroups(resourceGroups);
  };

  const handleMenuChange = (keys) => {
    const latestKey = keys.find((key) => !openKeys.includes(key));
    setOpenKeys(latestKey ? [latestKey] : []);
  };

  const handleMenuClick = (e) => {
    setActivekey(e.key);

    history.push(`/manage/${e.key}`);
  };

  const handleBack = () => {
    history.push('/connections');
  };

  const checkAndLogin = async () => {
    if (!userStore.haveUserInfo()) {
      return false;
    }
    return true;
  };
  useEffect(() => {
    async function asyncEffect() {
      const isLogin = await checkAndLogin();
      const canAcessRole = canAcess({
        resourceIdentifier: IManagerResourceType.role,
        action: 'read',
      }).accessible;
      if (isLogin) {
        if (canAcessRole) {
          _getRoleList();
        }
        _getPublicConnectionList();
        _getResourceGroupList();
      }
    }
    asyncEffect();
  }, []);
  console.log(taskStore.taskPageType);
  return (
    <ManageContext.Provider
      value={{
        users,
        roles,
        publicConnections,
        resourceGroups,
        activeMenuKey: activeKey,
        getUserList: _getUserList,
        getRoleList: _getRoleList,
        updateRoleById: _updateRoleById,
        getPublicConnectionList: _getPublicConnectionList,
        getResourceGroupList: _getResourceGroupList,
      }}
    >
      <div className={styles.task}>
        <div className={styles.sider}>
          <Sider handleTaskTypeChange={handleTaskTypeChange} />
        </div>
        <div className={styles.content}>
          <>
            {taskStore.taskPageType === TaskPageType.ALL ? (
              <LocalCommonTable
                ref={tableRef}
                titleContent={{}}
                operationContent={{
                  options: operationOptions,
                }}
                onLoad={loadData}
                onChange={handleTableChange}
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
            ) : (
              <CommonTable
                ref={tableRef}
                titleContent={{
                  title: TaskPageTypeMap[taskStore.taskPageType],
                }}
                operationContent={{
                  options: operationOptions,
                }}
                onLoad={loadData}
                onChange={handleTableChange}
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
            )}

            <FormTaskModal
              defaultTaskType={taskType}
              editId={editId}
              isCopy={isCopy}
              visible={formModalVisible}
              reloadData={reloadData}
              handleStatusChange={handleStatusChange}
              openOrderModal={openOrderModal}
              onClose={() => {
                setFormModalVisible(false);
                setEditId(null);
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
                        handleTask(currentTaskFlow.id, OperationType.COPY);
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
                        handleTask(currentTaskFlow.id, OperationType.EDIT);
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

                  <Button onClick={handleCloseDetailModal}>
                    {
                      formatMessage({
                        id: 'odc.components.TaskFlowPage.Close',
                      })

                      /*关闭*/
                    }
                  </Button>
                </Space>
              }
              onClose={handleCloseDetailModal}
              getDetail={getTaskFlowDetail}
              renderContent={(key, data) => <RecordContent activeKey={key} data={data} />}
            />

            <TaskOrderModal visible={orderModalVisible} onClose={handleCloseOrderModal} />
          </>
        </div>
      </div>
    </ManageContext.Provider>
  );
};
export default inject(
  'userStore',
  'settingStore',
  'schemaStore',
  'taskStore',
  'modalStore',
)(observer(Approval));
