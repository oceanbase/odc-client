import { DatabaseGroup } from '@/d.ts/database';
import { DataBaseOperationKey, getOperatioFunc } from '@/d.ts/operation';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import { getDataSourceModeConfig } from '@/common/datasource';
import { ProjectRole } from '@/d.ts/project';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import tracert from '@/util/tracert';
import { formatMessage } from '@/util/intl';
import { TaskPageType, TaskType, ConnectType } from '@/d.ts';
import setting from '@/store/setting';
import { Modal, message } from 'antd';
import modalStore from '@/store/modal';
import { gotoSQLWorkspace } from '@/util/route';
import { IProject } from '@/d.ts/project';
import { isLogicalDatabase } from '@/util/database';
import { deleteLogicalDatabse } from '@/common/network/logicalDatabase';
import { IOperation } from '@/d.ts/operation';
import { isString } from 'lodash';

const GroupKey = Symbol('group').toString();

const getGroupMapId = (record: IDatabase, groupMode) => {
  if (!record) {
    return undefined;
  }
  const { dataSource } = record;
  const { clusterName, tenantName } = dataSource || {};
  switch (groupMode) {
    case DatabaseGroup.dataSource: {
      return record?.dataSource?.id;
    }
    case DatabaseGroup.environment: {
      return record?.environment?.id;
    }
    case DatabaseGroup.cluster: {
      return record?.dataSource?.clusterName || '无集群';
    }
    case DatabaseGroup.connectType: {
      return record?.connectType;
    }
    case DatabaseGroup.tenant: {
      return tenantName && clusterName ? `${tenantName}@${clusterName}` : '无租户';
    }
  }
};

type getDatabaseOperation = (params: {
  id: string;
  record: IDatabase;
  project: IProject;
  setDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
  setChangeOwnerModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenManageLogicDatabase: React.Dispatch<React.SetStateAction<boolean>>;
  reload: () => void;
}) => IOperation[];

const getOperation: getDatabaseOperation = (params) => {
  const { record, project } = params;
  const isLogical = record.type === 'LOGICAL';
  if (!record.existed) {
    return getOrdinaryDatabaseOperation(params);
  }
  if (isLogical) {
    return getLogicalDatabaseOperation(params);
  }
  return getOrdinaryDatabaseOperation(params);
};

const getOrdinaryDatabaseOperation: getDatabaseOperation = (params) => {
  const {
    id,
    record,
    project,
    setDatabase,
    setChangeOwnerModalVisible,
    setVisible,
    setOpenManageLogicDatabase,
  } = params;
  const hasExportAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
  const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
  const config = getDataSourceModeConfig(record?.dataSource?.type);
  const hasDBAuth = !!record.authorizedPermissionTypes?.length;
  const notSupportToResourceTree = !config?.features?.groupResourceTree;
  const curRoles = project?.currentUserResourceRoles || [];
  const isOwnerOrDBA = curRoles.some((role) => [ProjectRole.OWNER, ProjectRole.DBA].includes(role));
  const disableTransfer =
    !!record?.dataSource?.projectId && !config?.schema?.innerSchema?.includes(record?.name);
  const existed = record.existed;
  const isFileSyetem = isConnectTypeBeFileSystemGroup(record.connectType);

  const ordinaryActions = [
    {
      key: DataBaseOperationKey.EXPORT,
      action: () => {
        tracert.click('a3112.b64002.c330858.d367383');
        handleMenuClick(TaskPageType.EXPORT, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.Export',
        defaultMessage: '导出',
      }),
      visible:
        config?.features?.task?.includes(TaskType.EXPORT) && setting.enableDBExport && existed,
      disable: !hasExportAuth || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.AD9F468B',
            defaultMessage: '该数据源类型不支持',
          });
        } else if (!hasExportAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.A74B21AE',
            defaultMessage: '暂无导出权限，请先申请数据库权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.IMPORT,
      action: () => {
        tracert.click('a3112.b64002.c330858.d367384');
        handleMenuClick(TaskPageType.IMPORT, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.Import',
        defaultMessage: '导入',
      }),
      visible:
        config?.features?.task?.includes(TaskType.IMPORT) && setting.enableDBImport && existed,
      disable: !hasChangeAuth || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.3B98A160',
            defaultMessage: '该数据源类型不支持',
          });
        } else if (!hasChangeAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.EA72923D',
            defaultMessage: '暂无变更权限，请先申请数据库权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.DDL,
      action: () => {
        tracert.click('a3112.b64002.c330858.d367385');
        handleMenuClick(TaskPageType.ASYNC, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.DatabaseChanges',
        defaultMessage: '数据库变更',
      }),
      visible: config?.features?.task?.includes(TaskType.ASYNC) && existed,
      disable: !hasChangeAuth || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.9628B84B',
            defaultMessage: '该数据源类型不支持',
          });
        } else if (!hasChangeAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.EA72923D',
            defaultMessage: '暂无变更权限，请先申请数据库权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.LOGIN,
      action: () => {
        tracert.click('a3112.b64002.c330858.d367381');
        gotoSQLWorkspace(
          parseInt(id),
          record?.dataSource?.id,
          record?.id,
          null,
          '',
          isLogicalDatabase(record),
        );
      },
      text: formatMessage({
        id: 'odc.Project.Database.LogOnToTheDatabase',
        defaultMessage: '登录数据库',
      }),
      visible: existed,
      disable: !hasDBAuth || notSupportToResourceTree || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.737317DB',
            defaultMessage: '该数据源类型不支持',
          });
        } else if (!hasDBAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.6EC9F229',
            defaultMessage: '暂无权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.CHANGEOWNER,
      action: () => {
        setChangeOwnerModalVisible(true);
        setDatabase(record);
      },
      text: formatMessage({
        id: 'src.page.Project.Database.DEFC0E70',
        defaultMessage: '设置库管理员',
      }),
      visible: existed,
      disable: !isOwnerOrDBA || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.E93B9BA4',
            defaultMessage: '该数据源类型不支持',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.TRANSFER,
      action: () => {
        tracert.click('a3112.b64002.c330858.d367387');
        setVisible(true);
        setDatabase(record);
      },
      text: formatMessage({
        id: 'odc.src.page.Project.Database.ModifyTheProject',
        defaultMessage: '\n                      修改所属项目\n                    ',
      }),
      visible: true,
      disable: !hasChangeAuth || disableTransfer || isFileSyetem,
      disableTooltip: () => {
        if (isFileSyetem) {
          return formatMessage({
            id: 'src.page.Project.Database.F9B0C796',
            defaultMessage: '该数据源类型不支持',
          });
        } else if (!hasChangeAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.8FB9732D',
            defaultMessage: '暂无权限',
          });
        } else if (disableTransfer) {
          return formatMessage({
            id: 'odc.src.page.Project.Database.TheDataSourceHasBeen',
            defaultMessage: '所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目',
          });
        } else {
          return '';
        }
      },
    },
  ];

  return ordinaryActions;
};

/** 逻辑库操作 */
const getLogicalDatabaseOperation: getDatabaseOperation = (params) => {
  const { record, project, setDatabase, reload, setOpenManageLogicDatabase } = params;
  const hasDBAuth = !!record.authorizedPermissionTypes?.length;
  const isOwnerOrDBA = project?.currentUserResourceRoles?.some((role) =>
    [ProjectRole.OWNER, ProjectRole.DBA].includes(role),
  );
  const hasOperateAuth = isOwnerOrDBA || hasDBAuth;
  const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
  const hasQueryAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.QUERY);
  /** 逻辑库专属操作 */
  const logicalActions = [
    {
      key: DataBaseOperationKey.MANAGE_LOGIN_DATABASE,
      action: () => {
        setDatabase(record);
        setOpenManageLogicDatabase(true);
      },
      text: formatMessage({
        id: 'src.page.Project.Database.D9A05E1E',
        defaultMessage: '逻辑表管理',
      }),
      visible: true,
      disable: !hasOperateAuth,
      disableTooltip: () => {
        if (!hasOperateAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.D8BEA086',
            defaultMessage: '暂无权限',
          });
        }
      },
    },
    {
      key: DataBaseOperationKey.UPDATE_LOGIN_DATABASE,
      action: () =>
        modalStore.changeLogicialDatabaseModal(true, {
          projectId: project?.id,
          databaseId: record?.id,
        }),
      text: formatMessage({
        id: 'src.page.Project.Database.D45EF5F3',
        defaultMessage: '逻辑库变更',
      }),
      visible: true,
      disable: !hasChangeAuth,
      disableTooltip: () => {
        if (!hasChangeAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.12FDA4F2',
            defaultMessage: '暂无权限, 请先申请库权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.LOGICAL_DATABASE_LOGIN,
      action: () => {
        gotoSQLWorkspace(
          project?.id,
          record?.dataSource?.id,
          record?.id,
          null,
          '',
          isLogicalDatabase(record),
        );
      },
      text: formatMessage({
        id: 'src.page.Project.Database.F8F1FF42',
        defaultMessage: '登录数据库',
      }),
      visible: true,
      disable: !hasQueryAuth,
      disableTooltip: () => {
        if (!hasQueryAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.8B2C5A3A',
            defaultMessage: '暂无权限, 请先申请库权限',
          });
        } else {
          return '';
        }
      },
    },
    {
      key: DataBaseOperationKey.DELETE_LOGIN_DATABASE,
      action: () => {
        Modal.confirm({
          title: formatMessage(
            {
              id: 'src.page.Project.Database.DFEFF83D',
              defaultMessage: '确认要移除逻辑库 {recordName} 吗？',
            },
            { recordName: record.name },
          ),
          centered: true,
          content: formatMessage({
            id: 'src.page.Project.Database.4EC56DD2',
            defaultMessage: '仅移除逻辑库及其相关配置，不影响实际数据库的数据。',
          }),
          cancelText: formatMessage({
            id: 'src.page.Project.Database.4F537F46',
            defaultMessage: '取消',
          }),
          okText: formatMessage({
            id: 'src.page.Project.Database.0DD4D2EB',
            defaultMessage: '移除',
          }),
          okType: 'danger',
          onCancel: () => {},
          onOk: async () => {
            const successful = await deleteLogicalDatabse(record?.id);
            if (successful) {
              message.success(
                formatMessage({
                  id: 'src.page.Project.Database.026A9C34',
                  defaultMessage: '移除成功',
                }),
              );
              reload?.();
              return;
            }
            showDeleteErrorModal(record.name);
          },
        });
      },
      text: formatMessage({
        id: 'src.page.Project.Database.3A2CD412',
        defaultMessage: '移除逻辑库',
      }),
      visible: true,
      disable: !hasChangeAuth,
      disableTooltip: () => {
        if (!hasChangeAuth) {
          return formatMessage({
            id: 'src.page.Project.Database.680DB47A',
            defaultMessage: '暂无权限',
          });
        } else {
          return '';
        }
      },
    },
  ];

  return logicalActions;
};

const handleMenuClick = (type: TaskPageType, databaseId: number) => {
  switch (type) {
    case TaskPageType.IMPORT:
      modalStore.changeImportModal(true, {
        databaseId,
      });
      break;
    case TaskPageType.EXPORT:
      modalStore.changeExportModal(true, {
        databaseId,
      });
      break;
    case TaskPageType.ASYNC:
      modalStore.changeCreateAsyncTaskModal(true, {
        databaseId,
      });
      break;
    default:
  }
};

const showDeleteErrorModal = (name: string) => {
  Modal.error({
    title: formatMessage(
      { id: 'src.page.Project.Database.2D8C1CD8', defaultMessage: '逻辑 {name} 移除失败？' },
      { name },
    ),
    centered: true,
    content: formatMessage({
      id: 'src.page.Project.Database.C8C89C9E',
      defaultMessage: '当前逻辑库存在执行中的工单，暂时无法删除，请完成或终止工单后再移除。',
    }),
  });
};

const isGroupColumn = (id) => {
  return isString(id) && id.includes(GroupKey);
};

export { getGroupMapId, getOperation, GroupKey, isGroupColumn };
