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

import { listDatabases } from '@/common/network/database';
import { listEnvironments } from '@/common/network/env';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Icon from '@ant-design/icons';
import Reload from '@/component/Button/Reload';
import HelpDoc from '@/component/helpDoc';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import { IConnectionStatus, TaskPageType, TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import modalStore from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import { Input, Space, Tag, Tooltip, Typography } from 'antd';
import { toInteger } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';
import AddDataBaseButton from './AddDataBaseButton';
import tracert from '@/util/tracert';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import {
  getDataSourceModeConfig,
  getDataSourceModeConfigByConnectionMode,
  getDataSourceStyleByConnectType,
} from '@/common/datasource';
import { ProjectRole } from '@/d.ts/project';
import ProjectContext from '../ProjectContext';
import styles from './index.less';
import setting from '@/store/setting';
import datasourceStatus from '@/store/datasourceStatus';
import { observer } from 'mobx-react';
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
    const res = await listDatabases(parseInt(id), null, current, pageSize, name, environmentId);
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
  const statusMap = datasourceStatus.statusMap;
  return (
    <TableCard
      title={<AddDataBaseButton onSuccess={() => reload()} projectId={parseInt(id)} />}
      extra={
        <Space>
          <Input.Search
            onSearch={(v) => {
              setSearchValue(v);
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
              const currentUserResourceRoles = project?.currentUserResourceRoles || [];
              const disabled =
                currentUserResourceRoles?.filter((roles) =>
                  [ProjectRole.DBA, ProjectRole.OWNER, ProjectRole.DEVELOPER]?.includes(roles),
                )?.length === 0;
              if (!record.existed) {
                return disabled ? (
                  <div className={styles.disable}>{name}</div>
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
                <div className={styles.disable}>{name}</div>
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
              if (!record.existed) {
                return '-';
              }
              const config = getDataSourceModeConfig(record?.dataSource?.type);
              const disabled =
                project?.currentUserResourceRoles?.filter((roles) =>
                  [ProjectRole.DBA, ProjectRole.OWNER]?.includes(roles),
                )?.length === 0;
              const disableTransfer =
                !!record?.dataSource?.projectId &&
                !config?.schema?.innerSchema?.includes(record?.name);
              return (
                <Action.Group size={3}>
                  {config?.features?.task?.includes(TaskType.EXPORT) && setting.enableDBExport && (
                    <Action.Link
                      key={'export'}
                      onClick={() => {
                        tracert.click('a3112.b64002.c330858.d367383');
                        handleMenuClick(TaskPageType.EXPORT, record.id);
                      }}
                      disabled={disabled}
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
                      disabled={disabled}
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
                    disabled={disabled}
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
                    disabled={disabled}
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
                    disabled={disabled || disableTransfer}
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
