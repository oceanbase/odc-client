import { TaskPageType, TaskType } from '@/d.ts';
import { DataBaseOperationKey, IOperation } from '@/d.ts/operation';
import { formatMessage } from '@/util/intl';
import modalStore from '@/store/modal';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import { isLogicalDatabase } from '@/util/database';
import { gotoSQLWorkspace } from '@/util/route';
import { IProject } from '@/d.ts/project';
import { getDataSourceModeConfig } from '@/common/datasource';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import setting from '@/store/setting';

type TGetDatabaseOperation = (params: { record: IDatabase; project: IProject }) => IOperation[];

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
/** 逻辑库操作 */
const getLogicalDatabaseOperation: TGetDatabaseOperation = (params) => {
  const { record, project } = params;
  const hasDBAuth = !!record.authorizedPermissionTypes?.length;
  const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
  const hasQueryAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.QUERY);
  /** 逻辑库专属操作 */
  const logicalActions = [
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
      disable: !hasDBAuth || !hasChangeAuth,
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
      disable: !hasDBAuth || !hasQueryAuth,
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
  ];

  return logicalActions;
};
const getOrdinaryDatabaseOperation = ({ record, project }) => {
  const hasExportAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
  const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
  const config = getDataSourceModeConfig(record?.dataSource?.type);
  const hasDBAuth = !!record.authorizedPermissionTypes?.length;
  const hasProjectAuth = record?.project?.currentUserResourceRoles;
  const notSupportToResourceTree = !config?.features?.resourceTree;
  const existed = record.existed;
  const isFileSyetem = isConnectTypeBeFileSystemGroup(record.connectType);

  const ordinaryActions = [
    {
      key: DataBaseOperationKey.EXPORT,
      action: () => {
        handleMenuClick(TaskPageType.EXPORT, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.Export',
        defaultMessage: '导出',
      }),
      visible:
        config?.features?.task?.includes(TaskType.EXPORT) && setting.enableDBExport && existed,
      disable: !hasExportAuth || isFileSyetem || !hasProjectAuth,
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
        handleMenuClick(TaskPageType.IMPORT, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.Import',
        defaultMessage: '导入',
      }),
      visible:
        config?.features?.task?.includes(TaskType.IMPORT) && setting.enableDBImport && existed,
      disable: !hasChangeAuth || isFileSyetem || !hasProjectAuth,
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
        handleMenuClick(TaskPageType.ASYNC, record.id);
      },
      text: formatMessage({
        id: 'odc.Project.Database.DatabaseChanges',
        defaultMessage: '数据库变更',
      }),
      visible: config?.features?.task?.includes(TaskType.ASYNC) && existed,
      disable: !hasDBAuth || !hasChangeAuth || isFileSyetem || !hasProjectAuth,
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
        gotoSQLWorkspace(
          parseInt(project.id),
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
      disable: !hasDBAuth || notSupportToResourceTree || isFileSyetem || !hasProjectAuth,
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
  ];

  return ordinaryActions;
};

export const getRecentlyDatabaseOperation: TGetDatabaseOperation = (params) => {
  const { record } = params;
  const isLogical = record.type === 'LOGICAL';
  if (!record.existed) {
    return getOrdinaryDatabaseOperation(params);
  }
  if (isLogical) {
    return getLogicalDatabaseOperation(params);
  }
  return getOrdinaryDatabaseOperation(params);
};
