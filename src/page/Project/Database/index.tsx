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
import React, { useContext, useEffect, useRef, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddDataBaseButton from './components/AddDataBaseButton';
import ChangeOwnerModal from './components/ChangeOwnerModal';
import { CreateLogicialDatabase, ManageLogicDatabase } from './components/LogicDatabase';
import Header from './Header';
import styles from './index.less';
import ParamContext, { IFilterParams } from './ParamContext';
import StatusName from './StatusName';
interface IProps {
  id: string;
  modalStore?: ModalStore;
}

const Database: React.FC<IProps> = ({ id, modalStore }) => {
  const statusMap = datasourceStatus.statusMap;
  const { project } = useContext(ProjectContext);
  console.log(project);
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
    loadData(params.current.pageSize, params.current.current);
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
  const renderNoPermissionDBWithTip = (name: React.ReactNode) => {
    return (
      <span className={styles.disable}>
        <Tooltip
          title={formatMessage({
            id: 'src.page.Project.Database.B4A5A6AC',
            defaultMessage: '当前账号的项目成员角色没有该库的操作权限，请先申请库权限',
          })}
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
      title: `逻辑 ${name} 移除失败？`,
      centered: true,
      content: '当前逻辑库存在执行中的工单，暂时无法删除，请完成或终止工单后再移除。',
    });
  };

  const curRoles = project?.currentUserResourceRoles || [];
  const isOwner = curRoles.some((role) => [ProjectRole.OWNER].includes(role));

  return (
    <TableCard
      title={
        <AddDataBaseButton
          orderedDatabaseIds={
            selectedRowKeys?.length ? [selectedRowKeys as number[]] : [[undefined]]
          }
          clearSelectedRowKeys={clearSelectedRowKeys}
          modalStore={modalStore}
          onSuccess={() => reload()}
          projectId={parseInt(id)}
          onOpenLogicialDatabase={() => setOpenLogicialDatabase(true)}
        />
      }
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
        rowSelection={{
          selectedRowKeys: selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (selectedRowKeys: React.Key[], selectedRows: IDatabase[]) => {
            setSelectedRowKeys(selectedRowKeys);
          },
          getCheckboxProps: (record: IDatabase) => {
            const hasChangeAuth = record.authorizedPermissionTypes?.includes(
              DatabasePermissionType.CHANGE,
            );
            const hasQueryAuth = record.authorizedPermissionTypes?.includes(
              DatabasePermissionType.QUERY,
            );
            const disabled =
              !hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length;
            const status = statusMap.get(record?.dataSource?.id) || record?.dataSource?.status;

            return {
              disabled:
                disabled ||
                !record.existed ||
                ![IConnectionStatus.ACTIVE, IConnectionStatus.TESTING]?.includes(status?.status),
              name: record.name,
            };
          },
        }}
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
                !hasChangeAuth && !hasQueryAuth && !record?.authorizedPermissionTypes?.length;
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
                    {renderNoPermissionDBWithTip(name)}
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
                renderNoPermissionDBWithTip(name)
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {record?.type === 'LOGICAL' && <LogicIcon />}
                  <Icon
                    component={style?.icon?.component}
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
            width: 210,
            render(_, record) {
              const config = getDataSourceModeConfig(record?.dataSource?.type);
              const notSupportToResourceTree = !config?.features?.resourceTree;
              const disableTransfer =
                !!record?.dataSource?.projectId &&
                !config?.schema?.innerSchema?.includes(record?.name);
              const hasExportAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.EXPORT,
              );
              const hasChangeAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.CHANGE,
              );

              const hasQueryAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.QUERY,
              );

              const curRoles = project?.currentUserResourceRoles || [];
              const isOwnerOrDBA = curRoles.some((role) =>
                [ProjectRole.OWNER, ProjectRole.DBA].includes(role),
              );
              const isParticipant = curRoles.some((role) =>
                [ProjectRole.PARTICIPANT].includes(role),
              );
              const hasLoginAuth = !!record.authorizedPermissionTypes?.length;

              if (!record.existed) {
                return (
                  <Action.Group size={3}>
                    <Action.Link
                      key={'transfer'}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367387');
                        setVisible(true);
                        setDatabase(record);
                      }}
                      disabled={!hasChangeAuth || disableTransfer}
                      tooltip={
                        !hasChangeAuth || disableTransfer
                          ? formatMessage({
                              id: 'src.page.Project.Database.8FB9732D',
                              defaultMessage: '暂无权限',
                            })
                          : ''
                      }
                    >
                      <Tooltip
                        title={
                          disableTransfer
                            ? formatMessage({
                                id: 'odc.src.page.Project.Database.TheDataSourceHasBeen',
                                defaultMessage:
                                  '所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目',
                              }) //`所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目`
                            : null
                        }
                      >
                        {
                          formatMessage({
                            id: 'odc.src.page.Project.Database.ModifyTheProject',
                            defaultMessage:
                              '\n                      修改所属项目\n                    ',
                          }) /* 
                      修改所属项目
                      */
                        }
                      </Tooltip>
                    </Action.Link>
                  </Action.Group>
                );
              }
              if (record.type === 'LOGICAL') {
                return (
                  <Action.Group size={2}>
                    <Action.Link
                      key={'manage'}
                      onClick={() => {
                        setDatabase(record);
                        setOpenManageLogicDatabase(true);
                      }}
                      disabled={!isOwnerOrDBA}
                      tooltip={!isOwnerOrDBA ? '暂无权限' : ''}
                    >
                      逻辑表管理
                    </Action.Link>
                    <Action.Link
                      key={'update'}
                      onClick={() =>
                        modalStore.changeLogicialDatabaseModal(true, {
                          projectId: project?.id,
                          databaseId: record?.id,
                        })
                      }
                      disabled={!hasChangeAuth}
                      tooltip={!hasChangeAuth ? '暂无权限, 请先申请库权限' : ''}
                    >
                      逻辑库变更
                    </Action.Link>
                    <Action.Link
                      disabled={!hasQueryAuth}
                      tooltip={!hasQueryAuth ? '暂无权限, 请先申请库权限' : ''}
                      key={'login'}
                      onClick={() => {
                        gotoSQLWorkspace(
                          project?.id,
                          record?.dataSource?.id,
                          record?.id,
                          null,
                          '',
                          isLogicalDatabase(record),
                        );
                      }}
                    >
                      登录数据库
                    </Action.Link>
                    <Action.Link
                      disabled={!isOwnerOrDBA}
                      tooltip={!isOwnerOrDBA ? '暂无权限' : ''}
                      key={'delete'}
                      onClick={() => {
                        Modal.confirm({
                          title: `确认要移除逻辑库 ${record.name} 吗？`,
                          centered: true,
                          content: '仅移除逻辑库及其相关配置，不影响实际数据库的数据。',
                          cancelText: '取消',
                          okText: '移除',
                          okType: 'danger',
                          onCancel: () => {},
                          onOk: async () => {
                            const successful = await deleteLogicalDatabse(record?.id);
                            if (successful) {
                              message.success('移除成功');
                              reload?.();
                              return;
                            }
                            showDeleteErrorModal(record.name);
                          },
                        });
                      }}
                    >
                      移除逻辑库
                    </Action.Link>
                  </Action.Group>
                );
              }
              return (
                <Action.Group size={3}>
                  {config?.features?.task?.includes(TaskType.EXPORT) && setting.enableDBExport && (
                    <Action.Link
                      key={'export'}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367383');
                        handleMenuClick(TaskPageType.EXPORT, record.id);
                      }}
                      disabled={!hasExportAuth}
                      tooltip={
                        !hasExportAuth
                          ? formatMessage({
                              id: 'src.page.Project.Database.A74B21AE',
                              defaultMessage: '暂无导出权限，请先申请数据库权限',
                            })
                          : ''
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.Project.Database.Export',
                          defaultMessage: '导出',
                        }) /*导出*/
                      }
                    </Action.Link>
                  )}

                  {config?.features?.task?.includes(TaskType.IMPORT) && setting.enableDBImport && (
                    <Action.Link
                      key={'import'}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367384');
                        handleMenuClick(TaskPageType.IMPORT, record.id);
                      }}
                      disabled={!hasChangeAuth}
                      tooltip={
                        !hasChangeAuth
                          ? formatMessage({
                              id: 'src.page.Project.Database.EA72923D',
                              defaultMessage: '暂无变更权限，请先申请数据库权限',
                            })
                          : ''
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.Project.Database.Import',
                          defaultMessage: '导入',
                        }) /*导入*/
                      }
                    </Action.Link>
                  )}

                  {config?.features?.task?.includes(TaskType.ASYNC) && (
                    <Action.Link
                      key={'ddl'}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367385');
                        handleMenuClick(TaskPageType.ASYNC, record.id);
                      }}
                      disabled={!hasChangeAuth}
                      tooltip={
                        !hasChangeAuth
                          ? formatMessage({
                              id: 'src.page.Project.Database.8AFF2CDE',
                              defaultMessage: '暂无变更权限，请先申请数据库权限',
                            })
                          : ''
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.Project.Database.DatabaseChanges',
                          defaultMessage: '数据库变更',
                        }) /*数据库变更*/
                      }
                    </Action.Link>
                  )}
                  <Action.Link
                    key={'login'}
                    onClick={() => {
                      tracert.click('a3112.b64002.c330858.d367381');
                      gotoSQLWorkspace(
                        parseInt(id),
                        record?.dataSource?.id,
                        record?.id,
                        null,
                        '',
                        isLogicalDatabase(record),
                      );
                    }}
                    disabled={!hasLoginAuth || notSupportToResourceTree}
                    tooltip={
                      !hasLoginAuth
                        ? formatMessage({
                            id: 'src.page.Project.Database.6EC9F229',
                            defaultMessage: '暂无权限',
                          })
                        : ''
                    }
                  >
                    {
                      formatMessage({
                        id: 'odc.Project.Database.LogOnToTheDatabase',
                        defaultMessage: '登录数据库',
                      }) /*登录数据库*/
                    }
                  </Action.Link>
                  <Action.Link
                    key={'changeOwner'}
                    onClick={() => {
                      setChangeOwnerModalVisible(true);
                      setDatabase(record);
                    }}
                    disabled={!isOwnerOrDBA}
                  >
                    {formatMessage({
                      id: 'src.page.Project.Database.DEFC0E70',
                      defaultMessage: '设置库管理员',
                    })}
                  </Action.Link>
                  <Action.Link
                    key={'transfer'}
                    onClick={() => {
                      tracert.click('a3112.b64002.c330858.d367387');
                      setVisible(true);
                      setDatabase(record);
                    }}
                    disabled={!hasChangeAuth || disableTransfer}
                    tooltip={
                      !hasChangeAuth || disableTransfer
                        ? formatMessage({
                            id: 'src.page.Project.Database.8FB9732D',
                            defaultMessage: '暂无权限',
                          })
                        : ''
                    }
                  >
                    <Tooltip
                      title={
                        disableTransfer
                          ? formatMessage({
                              id: 'odc.src.page.Project.Database.TheDataSourceHasBeen',
                              defaultMessage:
                                '所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目',
                            }) //`所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目`
                          : null
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.src.page.Project.Database.ModifyTheProject',
                          defaultMessage:
                            '\n                      修改所属项目\n                    ',
                        }) /* 
                    修改所属项目
                    */
                      }
                    </Tooltip>
                  </Action.Link>
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
        close={() => setChangeOwnerModalVisible(false)}
        onSuccess={() => reload()}
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
