/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getDataSourceModeConfig, getDataSourceStyleByConnectType } from '@/common/datasource';
import { getDatabase, listDatabases } from '@/common/network/database';
import { listEnvironments } from '@/common/network/env';
import { deleteLogicalDatabse } from '@/common/network/logicalDatabase';
import Action from '@/component/Action';
import HelpDoc from '@/component/helpDoc';
import LogicIcon from '@/component/logicIcon';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import LogicDatabaseAsyncTask from '@/component/Task/LogicDatabaseAsyncTask';
import MutipleAsyncTask from '@/component/Task/MutipleAsyncTask';
import { IConnectionStatus, TaskPageType, TaskType } from '@/d.ts';
import { DataBaseOperationKey, getOperatioFunc } from '@/d.ts/operation';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import { ProjectRole } from '@/d.ts/project';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import datasourceStatus from '@/store/datasourceStatus';
import { ModalStore } from '@/store/modal';
import setting from '@/store/setting';
import { isLogicalDatabase } from '@/util/database';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { message, Modal, Space, Tooltip, Typography } from 'antd';
import { toInteger } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddDataBaseButton from './components/AddDataBaseButton';
import ChangeOwnerModal from './components/ChangeOwnerModal';
import { CreateLogicialDatabase, ManageLogicDatabase } from './components/LogicDatabase';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import AddObjectStorage from './components/AddObjectStorage';
import Header from './Header';
import styles from './index.less';
import ParamContext, { IFilterParams } from './ParamContext';
import StatusName from './StatusName';
import { isProjectArchived } from '@/page/Project/helper';
import { renderTool } from '@/util/renderTool';

interface IProps {
  id: string;
  modalStore?: ModalStore;
}

const Database: React.FC<IProps> = ({ id, modalStore }) => {
  const statusMap = datasourceStatus.statusMap;
  const { project, setHasLoginDatabaseAuth } = useContext(ProjectContext);
  const projectArchived = isProjectArchived(project);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [filterParams, setFilterParams] = useState<IFilterParams>({
    environmentId: null,
    connectType: null,
    type: null,
  });
  const [data, setData] = useState<IDatabase[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visible, setVisible] = useState(false);
  /**
   * 修改管理员弹窗显示与隐藏
   */
  const [changeOwnerModalVisible, setChangeOwnerModalVisible] = useState(false);
  const [openLogicialDatabase, setOpenLogicialDatabase] = useState<boolean>(false);
  const [openObjectStorage, setOpenObjectStorage] = useState<boolean>(false);
  const [openManageLogicDatabase, setOpenManageLogicDatabase] = useState<boolean>(false);
  const [database, setDatabase] = useState<IDatabase>(null);
  const params = useRef({
    pageSize: 0,
    current: 0,
  });
  const { data: envList } = useRequest(listEnvironments);
  useEffect(() => {
    tracert.expo('a3112.b64002.c330858');
  }, []);

  useEffect(() => {
    loadData(params.current.pageSize, 1);
  }, [filterParams]);

  const loadData = async (
    pageSize,
    current,
    name: string = searchValue,
    environmentId = filterParams?.environmentId,
    connectType = filterParams?.connectType,
    type = filterParams.type,
  ) => {
    params.current.pageSize = pageSize;
    params.current.current = current;
    const res = await listDatabases(
      parseInt(id),
      null,
      current,
      pageSize,
      name,
      environmentId,
      null,
      null,
      true,
      type,
      connectType,
    );
    if (res) {
      datasourceStatus.asyncUpdateStatus(
        res?.contents
          ?.filter((item) => item.type !== 'LOGICAL')
          ?.map((item) => item?.dataSource?.id),
      );
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
      const hasLoginDatabaseAuth = res.contents?.some(
        (item) => !!item.authorizedPermissionTypes.length,
      );
      if (hasLoginDatabaseAuth) {
        setHasLoginDatabaseAuth?.(hasLoginDatabaseAuth);
      }
    }
  };
  function reload(name: string = searchValue) {
    loadData(params.current.pageSize, params.current.current, name);
  }
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
  const renderNoPermissionDBWithTip = (name: React.ReactNode, showTip = true) => {
    return (
      <span className={styles.disable}>
        <Tooltip
          title={
            showTip
              ? formatMessage({
                  id: 'src.page.Project.Database.B4A5A6AC',
                  defaultMessage: '当前账号的项目成员角色没有该库的操作权限，请先申请库权限',
                })
              : ''
          }
        >
          {name}
        </Tooltip>
      </span>
    );
  };

  const clearSelectedRowKeys = () => {
    setSelectedRowKeys([]);
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

  const curRoles = project?.currentUserResourceRoles || [];
  const isOwner = curRoles.some((role) => [ProjectRole.OWNER].includes(role));

  const initDialectType = useMemo(() => {
    return data?.find((_db) => _db?.id === selectedRowKeys?.[0])?.connectType;
  }, [selectedRowKeys[0]]);

  const disabledMultiDBChanges = useMemo(() => {
    if (!selectedRowKeys?.length) return false;
    return !selectedRowKeys?.every(
      (key) =>
        /* 当前数据库分页没有这一条数据 */
        !data?.find((_db) => _db?.id === key) ||
        /* 当前数据库分页有这一条数据且类型相同 */
        data?.find((_db) => _db?.id === key)?.connectType === initDialectType,
    );
  }, [selectedRowKeys, data]);

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (selectedRowKeys: React.Key[], selectedRows: IDatabase[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record: IDatabase) => {
      const hasChangeAuth = record.authorizedPermissionTypes?.includes(
        DatabasePermissionType.CHANGE,
      );
      const hasQueryAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.QUERY);
      const disabled =
        !hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length;
      const status = statusMap.get(record?.dataSource?.id) || record?.dataSource?.status;
      const config = getDataSourceModeConfig(record?.dataSource?.type);

      return {
        disabled:
          disabled ||
          !record.existed ||
          ![IConnectionStatus.ACTIVE, IConnectionStatus.TESTING]?.includes(status?.status) ||
          !config?.features?.task?.includes(TaskType.MULTIPLE_ASYNC),
        name: record.name,
      };
    },
  };

  const tablrCardTitle = (
    <AddDataBaseButton
      orderedDatabaseIds={selectedRowKeys?.length ? [selectedRowKeys as number[]] : [[undefined]]}
      disabledMultiDBChanges={disabledMultiDBChanges}
      clearSelectedRowKeys={clearSelectedRowKeys}
      modalStore={modalStore}
      onSuccess={() => reload()}
      projectId={parseInt(id)}
      onOpenLogicialDatabase={() => setOpenLogicialDatabase(true)}
      onOpenObjectStorage={() => setOpenObjectStorage(true)}
      onOpenDatabaseAdmin={() => {
        setChangeOwnerModalVisible(true);
      }}
    />
  );

  const getOperation: getOperatioFunc<IDatabase> = (record: IDatabase) => {
    const isLogical = record.type === 'LOGICAL';
    if (!record.existed) {
      return getOrdinaryDatabaseOperation(record);
    }
    if (isLogical) {
      return getLogicalDatabaseOperation(record);
    }
    return getOrdinaryDatabaseOperation(record);
  };

  const getOrdinaryDatabaseOperation = (record) => {
    const hasExportAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.EXPORT);
    const hasChangeAuth = record.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE);
    const config = getDataSourceModeConfig(record?.dataSource?.type);
    const hasDBAuth = !!record.authorizedPermissionTypes?.length;
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
  const getLogicalDatabaseOperation = (record) => {
    const hasDBAuth = !!record.authorizedPermissionTypes?.length;
    const isOwnerOrDBA = curRoles.some((role) =>
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

  return (
    <TableCard
      title={projectArchived ? null : tablrCardTitle}
      extra={
        <ParamContext.Provider
          value={{
            searchValue,
            setSearchValue,
            filterParams,
            setFilterParams,
            reload: () => {
              params.current.current = 1;
              reload();
            },
            envList,
          }}
        >
          <Space>
            <Header />
          </Space>
        </ParamContext.Provider>
      }
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        rowSelection={projectArchived ? null : rowSelection}
        scroll={{
          x: 1150,
        }}
        columns={[
          {
            title: formatMessage({
              id: 'odc.Project.Database.DatabaseName',
              defaultMessage: '数据库名称',
            }),
            //数据库名称
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            ellipsis: true,
            width: 250,
            render: (name, record) => {
              const hasChangeAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.CHANGE,
              );
              const hasQueryAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.QUERY,
              );
              const disabled =
                (!hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length) ||
                projectArchived;
              const style = getDataSourceStyleByConnectType(record?.dataSource?.type);
              if (!record.existed) {
                return disabled ? (
                  <HelpDoc
                    leftText
                    isTip={false}
                    title={formatMessage({
                      id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                      defaultMessage: '当前数据库不存在',
                    })} /*当前数据库不存在*/
                  >
                    {renderNoPermissionDBWithTip(name, !projectArchived)}
                  </HelpDoc>
                ) : (
                  <HelpDoc
                    leftText
                    isTip={false}
                    title={formatMessage({
                      id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                      defaultMessage: '当前数据库不存在',
                    })} /*当前数据库不存在*/
                  >
                    {name}
                  </HelpDoc>
                );
              }

              return disabled ? (
                renderNoPermissionDBWithTip(name, !projectArchived)
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {record?.type === 'LOGICAL' && <LogicIcon />}
                  <Icon
                    component={
                      isConnectTypeBeFileSystemGroup(record.connectType)
                        ? style?.dbIcon?.component
                        : style?.icon?.component
                    }
                    style={{
                      color: style?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <Space>
                    <StatusName
                      item={record}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367382');
                        gotoSQLWorkspace(
                          toInteger(id),
                          null,
                          record.id,
                          null,
                          '',
                          isLogicalDatabase(record),
                        );
                      }}
                    />

                    <Typography.Text type="secondary" title={record?.alias}>
                      {record?.alias}
                    </Typography.Text>
                  </Space>
                </div>
              );
            },
          },
          {
            title: formatMessage({
              id: 'src.page.Project.Database.A31E6BDF',
              defaultMessage: '管理员',
            }),
            //项目角色
            dataIndex: 'owners',
            key: 'owners',
            ellipsis: true,
            width: 160,
            render(v) {
              return v?.length > 0 ? (
                v.map(({ name }) => name)?.join(' | ')
              ) : (
                <span style={{ color: 'var(--text-color-hint)' }}>
                  {formatMessage({
                    id: 'odc.Project.Database.OwnerEmptyText',
                    defaultMessage: '未设置',
                  })}
                </span>
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.DataSource',
              defaultMessage: '所属数据源',
            }),
            //所属数据源
            dataIndex: ['dataSource', 'name'],
            key: 'dataSource-name',
            width: 160,
            ellipsis: {
              showTitle: false,
            },
            render(value, record, index) {
              /**
               * return datasource icon + label
               */
              const style = getDataSourceStyleByConnectType(record.dataSource?.type);
              if (!value) {
                return '-';
              }
              return (
                <>
                  <Icon
                    component={style?.icon?.component}
                    style={{
                      color: style?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <Tooltip title={value}>{value}</Tooltip>
                </>
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Environment',
              defaultMessage: '环境',
            }),
            //环境
            dataIndex: 'environmentId',
            key: 'environmentId',
            width: 80,
            render(value, record, index) {
              return (
                <RiskLevelLabel
                  color={record?.environment?.style}
                  content={record?.environment?.name}
                />
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.CharacterEncoding',
              defaultMessage: '字符编码',
            }),
            //字符编码
            dataIndex: 'charsetName',
            key: 'charsetName',
            width: 120,
            render: (value) => (value ? value : '-'),
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.SortingRules',
              defaultMessage: '排序规则',
            }),
            //排序规则
            dataIndex: 'collationName',
            key: 'collationName',
            width: 120,
            ellipsis: true,
            render: (collationName) => collationName || '-',
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.LastSynchronizationTime',
              defaultMessage: '上一次同步时间',
            }),
            //上一次同步时间
            dataIndex: 'objectLastSyncTime',
            key: 'objectLastSyncTime',
            width: 170,
            render(v, record) {
              const time = record?.objectLastSyncTime || record?.lastSyncTime;
              return getLocalFormatDateTime(time);
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Operation',
              defaultMessage: '操作',
            }),
            //操作
            dataIndex: 'actions',
            key: 'actions',
            width: 210,
            hide: projectArchived,
            render(_, record) {
              const operation = getOperation(record);
              return (
                <Action.Group size={3}>
                  {operation.map((item, index) => {
                    return renderTool(item, index);
                  })}
                </Action.Group>
              );
            },
          },
        ]}
        dataSource={data}
        pagination={{
          total,
          current: params.current.current,
        }}
        loadData={(page) => {
          const pageSize = page.pageSize;
          const current = page.current;
          loadData(pageSize, current);
        }}
        enableResize
      />

      <ChangeProjectModal
        visible={visible}
        database={database}
        close={() => setVisible(false)}
        onSuccess={() => reload()}
      />

      <ChangeOwnerModal
        visible={changeOwnerModalVisible}
        database={database}
        databaseList={selectedRowKeys?.length ? (selectedRowKeys as number[]) : null}
        close={() => setChangeOwnerModalVisible(false)}
        onSuccess={() => {
          reload();
          setDatabase(null);
        }}
        projectId={project?.id}
      />

      <CreateLogicialDatabase
        projectId={project?.id}
        reload={reload}
        openLogicialDatabase={openLogicialDatabase}
        setOpenLogicialDatabase={setOpenLogicialDatabase}
        openLogicDatabaseManageModal={async (id) => {
          const res = await getDatabase(id);
          setDatabase(res?.data);
          setOpenManageLogicDatabase(true);
        }}
      />

      <AddObjectStorage
        open={openObjectStorage}
        setOpen={setOpenObjectStorage}
        onSuccess={() => reload()}
        projectId={parseInt(id)}
      />

      <ManageLogicDatabase
        database={database}
        openManageLogicDatabase={openManageLogicDatabase}
        setOpenManageLogicDatabase={setOpenManageLogicDatabase}
        isOwner={isOwner}
      />

      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal theme="white" />
      <MutipleAsyncTask />
      <LogicDatabaseAsyncTask theme="white" />
    </TableCard>
  );
};
export default inject('modalStore')(observer(Database));
