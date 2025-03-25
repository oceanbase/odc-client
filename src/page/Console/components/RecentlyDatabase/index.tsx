import { useContext, useState } from 'react';
import { Table, MenuProps, Tag, Tooltip, Empty, Spin } from 'antd';
import { useMount, useRequest } from 'ahooks';
import { ConsoleTextConfig, EDatabaseTableColumnKey } from '../../const';
import Icon from '@ant-design/icons';
import LabelWithIcon from '../LabelWithIcon';
import { getDataSourceModeConfig, getDataSourceStyleByConnectType } from '@/common/datasource';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { formatMessage } from '@/util/intl';
import { IDatabaseHistoriesParam, TaskPageType, TaskType } from '@/d.ts';
import setting from '@/store/setting';
import { DataBaseOperationKey } from '@/d.ts/operation';
import { ProjectRole } from '@/d.ts/project';
import { DatabasePermissionType } from '@/d.ts/database';
import Action from '@/component/Action';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import { renderTool } from '@/util/renderTool';
import { isLogicalDatabase } from '@/util/database';
import { gotoSQLWorkspace } from '@/util/route';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import ProjectContext from '@/page/Project/ProjectContext';
import styles from './index.less';
import { getDatabasesHistories } from '@/common/network/task';
import login from '@/store/login';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import ApplyPermission from '@/component/Task/ApplyPermission';
import ApplyDatabasePermission from '@/component/Task/ApplyDatabasePermission';

interface IProps {
  id?: string;
  modalStore?: ModalStore;
}

const RecentlyDatabase: React.FC<IProps> = ({ id, modalStore }) => {
  const {
    data: databaseList,
    run: runGetDatabasesHistories,
    loading,
  } = useRequest((params: IDatabaseHistoriesParam) => getDatabasesHistories(params), {
    manual: true,
  });
  const { columnNames, columnKeys, columnDataIndex } = ConsoleTextConfig.recently;
  const { project } = useContext(ProjectContext);

  useMount(() => {
    runGetDatabasesHistories({
      currentOrganizationId: login.organizationId,
      limit: 10,
    });
  });

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

  const handleApply = (type: TaskType) => {
    switch (type) {
      case TaskType.APPLY_DATABASE_PERMISSION:
        modalStore.changeApplyDatabasePermissionModal(true);
        break;
      case TaskType.APPLY_PROJECT_PERMISSION:
        modalStore.changeApplyPermissionModal(true);
        break;
      default:
    }
  };

  const getOrdinaryDatabaseOperation = (record) => {
    const hasExportAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
    const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
    const config = getDataSourceModeConfig(record?.dataSource?.type);
    const hasDBAuth = !!record.authorizedPermissionTypes?.length;
    const hasProjectAuth = record?.project?.currentUserResourceRoles;
    const notSupportToResourceTree = !config?.features?.resourceTree;
    const curRoles = project?.currentUserResourceRoles || [];
    const isOwnerOrDBA = curRoles.some((role) =>
      [ProjectRole.OWNER, ProjectRole.DBA].includes(role),
    );
    const disableTransfer =
      !!record?.dataSource?.projectId && !config?.schema?.innerSchema?.includes(record?.name);
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
        disable: !hasChangeAuth || isFileSyetem || !hasProjectAuth,
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

  const renderTooltipContent = ({ type, record }) => {
    switch (type) {
      case 'project':
        return (
          <div>
            {`'未加入项目【'${record?.project?.name || '-'}】请先`}
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#40a9ff' }}
              onClick={() => {
                handleApply(TaskType.APPLY_PROJECT_PERMISSION);
              }}
            >
              申请项目权限
            </a>
          </div>
        );
      case 'database':
        return (
          <div>
            暂无该数据库权限，请先
            <a
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#40a9ff' }}
              onClick={() => handleApply(TaskType.APPLY_DATABASE_PERMISSION)}
            >
              申请库权限
            </a>
          </div>
        );
      default:
        return '';
    }
  };

  const columns = columnNames.map((columnName, index) => {
    const key = columnKeys[index];
    const config = {
      title: columnName,
      dataIndex: columnDataIndex[index],
      key: key,
      render: (value, record) => {
        const hasProjectAuth = record?.project?.currentUserResourceRoles;
        const hasDBAuth = !!record?.authorizedPermissionTypes?.length;
        const actionStyle = hasProjectAuth ? styles.action : styles.disabledAction;
        switch (key) {
          case EDatabaseTableColumnKey.Operation:
            const operation = getOrdinaryDatabaseOperation(record);
            return (
              <div
                className={actionStyle}
                style={hasDBAuth ? {} : { filter: 'grayscale(1)', pointerEvents: 'none' }}
              >
                <Action.Group size={3}>
                  {operation.map((item, index) => {
                    return renderTool(item, index);
                  })}
                </Action.Group>
              </div>
            );
          case EDatabaseTableColumnKey.Recently:
            const databaseStyle = getDataSourceStyleByConnectType(record?.dataSource?.type);
            return (
              <div
                className={actionStyle}
                style={hasDBAuth ? {} : { filter: 'grayScale(1)', pointerEvents: 'none' }}
              >
                <LabelWithIcon
                  gap={4}
                  label={
                    <span
                      onClick={() => {
                        gotoSQLWorkspace(
                          parseInt(id),
                          record?.dataSource?.id,
                          record?.id,
                          null,
                          '',
                          isLogicalDatabase(record),
                        );
                      }}
                    >
                      {value}
                    </span>
                  }
                  icon={
                    <Icon
                      component={
                        isConnectTypeBeFileSystemGroup(record.connectType)
                          ? databaseStyle?.dbIcon?.component
                          : databaseStyle?.icon?.component
                      }
                      style={{
                        color: databaseStyle?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                  }
                />
              </div>
            );
          case EDatabaseTableColumnKey.DataSource:
            const style = getDataSourceStyleByConnectType(record.dataSource?.type);
            if (!value) {
              return <div>-</div>;
            }

            return (
              <div className={actionStyle}>
                <LabelWithIcon
                  gap={6}
                  label={
                    <Tooltip
                      overlayInnerStyle={{ whiteSpace: 'nowrap', width: 'fit-content' }}
                      title={renderTooltipContent({
                        type: hasProjectAuth ? (hasDBAuth ? '' : 'database') : 'project',
                        record,
                      })}
                    >
                      <span>{value}</span>
                    </Tooltip>
                  }
                  icon={
                    <Icon
                      component={style?.icon?.component}
                      style={{
                        color: style?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                  }
                />
              </div>
            );

          case EDatabaseTableColumnKey.Project:
            return (
              <div
                className={actionStyle}
                onClick={() => {
                  window.open(`/project/${value.id}`);
                }}
              >
                {value?.name || '-'}
              </div>
            );
          case EDatabaseTableColumnKey.Environment:
            return (
              <div className={styles.environment}>
                <RiskLevelLabel
                  color={record?.environment?.style}
                  content={record?.environment?.name}
                />
              </div>
            );
          default:
            return <>-</>;
        }
      },
    };
    return config;
  });

  return (
    <Spin spinning={loading}>
      {databaseList?.length > 0 ? (
        <Table
          className={styles.recentlyTable}
          columns={columns}
          dataSource={databaseList}
          size="small"
          pagination={false}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className={styles.databaseEmpty}
          description={'暂无最近访问的数据库'}
        />
      )}
      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal theme="white" />
      <ApplyPermission />
      <ApplyDatabasePermission />
    </Spin>
  );
};

export default inject('modalStore')(observer(RecentlyDatabase));
