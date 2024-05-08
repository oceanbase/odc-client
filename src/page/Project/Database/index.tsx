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
import { listDatabases } from '@/common/network/database';
import { listEnvironments } from '@/common/network/env';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import HelpDoc from '@/component/helpDoc';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import { TaskPageType, TaskType } from '@/d.ts';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import datasourceStatus from '@/store/datasourceStatus';
import modalStore from '@/store/modal';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import tracert from '@/util/tracert';
import { getLocalFormatDateTime } from '@/util/utils';
import Icon from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Input, Space, Tooltip } from 'antd';
import { toInteger } from 'lodash';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddDataBaseButton from './AddDataBaseButton';
import styles from './index.less';
import StatusName from './StatusName';
interface IProps {
  id: string;
}
const Database: React.FC<IProps> = ({ id }) => {
  const { project } = useContext(ProjectContext);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState<IDatabase[]>([]);
  const [visible, setVisible] = useState(false);
  const [database, setDatabase] = useState<IDatabase>(null);
  const params = useRef({
    pageSize: 0,
    current: 0,
    environmentId: null,
  });
  const { data: envList } = useRequest(listEnvironments);
  useEffect(() => {
    tracert.expo('a3112.b64002.c330858');
  }, []);
  const loadData = async (pageSize, current, environmentId, name: string = searchValue) => {
    params.current.pageSize = pageSize;
    params.current.current = current;
    params.current.environmentId = environmentId;
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
    );
    if (res) {
      datasourceStatus.asyncUpdateStatus(res?.contents?.map((item) => item?.dataSource?.id));
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };
  function reload(name: string = searchValue) {
    loadData(params.current.pageSize, params.current.current, params.current.environmentId, name);
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
  const renderDisabledDBWithTip = (name: React.ReactNode) => {
    return (
      <span className={styles.disable}>
        <Tooltip title={formatMessage({ id: 'src.page.Project.Database.B4A5A6AC' })}>
          {name}
        </Tooltip>
      </span>
    );
  };
  return (
    <TableCard
      title={<AddDataBaseButton onSuccess={() => reload()} projectId={parseInt(id)} />}
      extra={
        <Space>
          <Input.Search
            onSearch={(v) => {
              setSearchValue(v);
              params.current.current = 1;
              reload(v);
            }}
            placeholder={formatMessage({
              id: 'odc.Project.Database.SearchDatabase',
            })}
            /*搜索数据库*/ style={{
              width: 200,
            }}
          />

          <FilterIcon onClick={() => reload()}>
            <Reload />
          </FilterIcon>
        </Space>
      }
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        scroll={{
          x: 920,
        }}
        columns={[
          {
            title: formatMessage({
              id: 'odc.Project.Database.DatabaseName',
            }),
            //数据库名称
            dataIndex: 'name',
            fixed: 'left',
            ellipsis: true,
            render: (name, record) => {
              const disabled = !record?.authorizedPermissionTypes?.length;
              if (!record.existed) {
                return disabled ? (
                  <HelpDoc
                    leftText
                    isTip={false}
                    title={formatMessage({
                      id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                    })} /*当前数据库不存在*/
                  >
                    {renderDisabledDBWithTip(name)}
                  </HelpDoc>
                ) : (
                  <HelpDoc
                    leftText
                    isTip={false}
                    title={formatMessage({
                      id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                    })} /*当前数据库不存在*/
                  >
                    {name}
                  </HelpDoc>
                );
              }
              return disabled ? (
                renderDisabledDBWithTip(name)
              ) : (
                <StatusName
                  item={record}
                  onClick={() => {
                    tracert.click('a3112.b64002.c330858.d367382');
                    gotoSQLWorkspace(toInteger(id), null, record.id);
                  }}
                />
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.DataSource',
            }),
            //所属数据源
            dataIndex: ['dataSource', 'name'],
            width: 160,
            ellipsis: true,
            render(value, record, index) {
              /**
               * return datasource icon + label
               */
              const style = getDataSourceStyleByConnectType(record.dataSource?.type);
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

                  <span title={value}>{value}</span>
                </>
              );
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Environment',
            }),
            //环境
            dataIndex: 'environmentId',
            filters: envList?.map((env) => {
              return {
                text: env.name,
                value: env.id,
              };
            }),
            filterMultiple: false,
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
            }),
            //字符编码
            dataIndex: 'charsetName',
            width: 120,
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.SortingRules',
            }),
            //排序规则
            dataIndex: 'collationName',
            width: 120,
            ellipsis: true,
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.LastSynchronizationTime',
            }),
            //上一次同步时间
            dataIndex: 'lastSyncTime',
            width: 170,
            render(v) {
              return getLocalFormatDateTime(v);
            },
          },
          {
            title: formatMessage({
              id: 'odc.Project.Database.Operation',
            }),
            //操作
            dataIndex: 'actions',
            width: 200,
            render(_, record) {
              const config = getDataSourceModeConfig(record?.dataSource?.type);
              const disableTransfer =
                !!record?.dataSource?.projectId &&
                !config?.schema?.innerSchema?.includes(record?.name);
              const hasExportAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.EXPORT,
              );
              const hasChangeAuth = record.authorizedPermissionTypes?.includes(
                DatabasePermissionType.CHANGE,
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
                          ? formatMessage({ id: 'src.page.Project.Database.8FB9732D' })
                          : ''
                      }
                    >
                      <Tooltip
                        title={
                          disableTransfer
                            ? formatMessage({
                                id: 'odc.src.page.Project.Database.TheDataSourceHasBeen',
                              }) //`所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目`
                            : null
                        }
                      >
                        {
                          formatMessage({
                            id: 'odc.src.page.Project.Database.ModifyTheProject',
                          }) /* 
                  修改所属项目
                  */
                        }
                      </Tooltip>
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
                          ? formatMessage({ id: 'src.page.Project.Database.A74B21AE' })
                          : ''
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.Project.Database.Export',
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
                          ? formatMessage({ id: 'src.page.Project.Database.EA72923D' })
                          : ''
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.Project.Database.Import',
                        }) /*导入*/
                      }
                    </Action.Link>
                  )}

                  <Action.Link
                    key={'ddl'}
                    onClick={() => {
                      tracert.click('a3112.b64002.c330858.d367385');
                      handleMenuClick(TaskPageType.ASYNC, record.id);
                    }}
                    disabled={!hasChangeAuth}
                    tooltip={
                      !hasChangeAuth
                        ? formatMessage({ id: 'src.page.Project.Database.8AFF2CDE' })
                        : ''
                    }
                  >
                    {
                      formatMessage({
                        id: 'odc.Project.Database.DatabaseChanges',
                      }) /*数据库变更*/
                    }
                  </Action.Link>
                  <Action.Link
                    key={'login'}
                    onClick={() => {
                      tracert.click('a3112.b64002.c330858.d367381');
                      gotoSQLWorkspace(parseInt(id), record?.dataSource?.id, record?.id);
                    }}
                    disabled={!hasLoginAuth}
                    tooltip={
                      !hasLoginAuth
                        ? formatMessage({ id: 'src.page.Project.Database.6EC9F229' })
                        : ''
                    }
                  >
                    {
                      formatMessage({
                        id: 'odc.Project.Database.LogOnToTheDatabase',
                      }) /*登录数据库*/
                    }
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
                        ? formatMessage({ id: 'src.page.Project.Database.8FB9732D' })
                        : ''
                    }
                  >
                    <Tooltip
                      title={
                        disableTransfer
                          ? formatMessage({
                              id: 'odc.src.page.Project.Database.TheDataSourceHasBeen',
                            }) //`所属的数据源已关联当前项目，无法修改。可通过编辑数据源修改所属项目`
                          : null
                      }
                    >
                      {
                        formatMessage({
                          id: 'odc.src.page.Project.Database.ModifyTheProject',
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
        loadData={(page, filters) => {
          const pageSize = page.pageSize;
          const current = page.current;
          loadData(pageSize, current, filters['environmentId']?.[0]);
        }}
      />

      <ChangeProjectModal
        visible={visible}
        database={database}
        close={() => setVisible(false)}
        onSuccess={() => reload()}
      />

      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal theme="white" />
    </TableCard>
  );
};
export default observer(Database);
