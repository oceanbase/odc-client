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
import { formatMessage } from '@/util/intl';
import { Badge, Input, Popover, Select, Space, Spin, Tooltip, Tree } from 'antd';
import React, { Key, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.less';
import Icon, { SearchOutlined } from '@ant-design/icons';
import tracert from '@/util/tracert';
import { ConnectionMode, TaskType } from '@/d.ts';
import SessionContext from '../../context';
import { useRequest } from 'ahooks';
import { listDatabases } from '@/common/network/database';
import login from '@/store/login';
import { DataNode } from 'antd/lib/tree';
import {
  getDataSourceModeConfig,
  getDataSourceModeConfigByConnectionMode,
  getDataSourceStyleByConnectType,
} from '@/common/datasource';
import { ReactComponent as PjSvg } from '@/svgr/project_space.svg';
import { IDatabase } from '@/d.ts/database';
import { toInteger } from 'lodash';
import { useParams } from '@umijs/max';
import { EnvColorMap } from '@/constant';
import ConnectionPopover from '@/component/ConnectionPopover';
import { IProject } from '@/d.ts/project';
import { IDatasource } from '@/d.ts/datasource';
import { hasPermission, TaskTypeMap } from '@/component/Task/helper';
import { inject, observer } from 'mobx-react';
import { DataSourceStatusStore } from '@/store/datasourceStatus';
import StatusIcon from '@/component/StatusIcon/DataSourceIcon';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';

interface IDatabasesTitleProps {
  db: IDatabase;
  taskType: TaskType;
  disabled: boolean;
}

const DatabasesTitle: React.FC<IDatabasesTitleProps> = (props) => {
  const { taskType, db, disabled } = props;
  return (
    <>
      {disabled ? (
        <Tooltip
          placement={'right'}
          title={
            formatMessage({
              id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.7885F651',
            }) /*`暂无${TaskTypeMap?.[taskType] || ''}权限，请先申请库权限`*/
          }
        >
          <div className={styles.textoverflow}>{db.name}</div>
        </Tooltip>
      ) : (
        <Popover
          showArrow={false}
          placement={'right'}
          content={<ConnectionPopover connection={db?.dataSource} />}
        >
          <div className={styles.textoverflow}>{db.name}</div>
        </Popover>
      )}

      <Badge color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor} />
    </>
  );
};
export interface ISessionDropdownFiltersProps {
  projectId?: number;
  dialectTypes?: ConnectionMode[];
  dataSourceId?: number;
}
interface IProps {
  dialectTypes?: ConnectionMode[];
  width?: number | string;
  taskType?: TaskType;
  projectId?: number;
  filters?: ISessionDropdownFiltersProps;
  dataSourceStatusStore?: DataSourceStatusStore;
}
const SessionDropdown: React.FC<IProps> = function ({
  children,
  width,
  projectId,
  filters = null,
  dialectTypes,
  taskType,
  dataSourceStatusStore,
}) {
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const treeRef = useRef(null);
  const { datasourceId } = useParams<{
    datasourceId: string;
  }>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [from, setFrom] = useState<'project' | 'datasource'>('project');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  const hasDialectTypesFilter =
    filters?.dialectTypes && Array.isArray(filters?.dialectTypes) && filters?.dialectTypes?.length;
  const hasProjectIdFilter = !!filters?.projectId;
  const {
    data,
    run,
    loading: fetchLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });
  useEffect(() => {
    if (isOpen) {
      run(
        projectId,
        datasourceId && toInteger(datasourceId),
        1,
        99999,
        null,
        null,
        login.isPrivateSpace(),
        true,
        true,
      );
    }
  }, [isOpen]);
  const dataGroup = useMemo(() => {
    const datasources: Map<number, { datasource: IDatasource; databases: IDatabase[] }> = new Map();
    const projects: Map<number, { project: IProject; databases: IDatabase[] }> = new Map();
    const allProjects: IProject[] = [],
      allDatasources: IDatasource[] = [];
    data?.contents?.forEach((db) => {
      const { project, dataSource } = db;
      // 插入项目ID用于下方筛选
      dataSource.projectId = project?.id;
      const support =
        !taskType ||
        getDataSourceModeConfig(db.dataSource?.type)?.features?.task?.includes(taskType);
      if (!support) {
        return;
      }
      if (project) {
        const projectDatabases = projects.get(project?.id) || {
          project: project,
          databases: [],
        };
        projectDatabases.databases.push(db);
        if (!projects.has(project?.id)) {
          allProjects.push(project);
        }
        projects.set(project?.id, projectDatabases);
      }
      if (dataSource) {
        const datasourceDatabases = datasources.get(dataSource?.id) || {
          datasource: dataSource,
          databases: [],
        };
        datasourceDatabases.databases.push(db);
        if (!datasources.has(dataSource?.id)) {
          allDatasources.push(dataSource);
        }
        datasources.set(dataSource?.id, datasourceDatabases);
      }
    });
    let filterDataSources: IDatasource[];
    let filterProjects: IProject[];
    if (hasProjectIdFilter) {
      filterProjects = allProjects?.filter((project) => filters?.projectId === project?.id);
      filterDataSources = allDatasources?.filter(
        (datasource) => datasource?.projectId === filters?.projectId,
      );
    }
    if (hasDialectTypesFilter) {
      filterDataSources = allDatasources?.filter((datasource) =>
        filters?.dialectTypes?.includes(datasource?.dialectType),
      );
    }
    return {
      datasources,
      projects,
      allDatasources: hasDialectTypesFilter ? filterDataSources : allDatasources,
      allProjects: hasProjectIdFilter ? filterProjects : allProjects,
    };
  }, [data?.contents]);

  useEffect(() => {
    const databaseId = context?.databaseId;
    const db = data?.contents.find((db) => db.id === databaseId);
    if (db) {
      setExpandedKeys([db.dataSource.id]);
      setTimeout(() => {
        treeRef?.current?.scrollTo({ key: `db:${databaseId}` });
      }, 500);
    }
  }, [data?.contents]);

  useEffect(() => {
    if (dataGroup?.allDatasources) {
      dataSourceStatusStore.asyncUpdateStatus(dataGroup?.allDatasources?.map((a) => a.id));
    }
  }, [dataGroup?.allDatasources]);

  function onOpen(open: boolean) {
    if (!open) {
      setIsOpen(open);
      return;
    }
    setFrom(context?.from);
    tracert.click('a3112.b41896.c330994.d367631');
    setIsOpen(open);
  }
  async function reloadTree() {
    setExpandedKeys([]);
  }
  useEffect(() => {
    reloadTree();
  }, [from]);
  function treeData(): DataNode[] {
    const { allDatasources, allProjects, projects, datasources } = dataGroup;
    if (context?.datasourceMode) {
      return allDatasources
        ?.map((item) => {
          if (
            (datasourceId && toInteger(datasourceId) !== item.id) ||
            (!datasourceId && item.temp)
          ) {
            return null;
          }
          if (searchValue && !item.name?.toLowerCase().includes(searchValue?.toLowerCase())) {
            return null;
          }
          return {
            title: (
              <Popover
                showArrow={false}
                placement={'right'}
                content={<ConnectionPopover connection={item} />}
              >
                <div className={styles.textoverflow}>{item.name}</div>
              </Popover>
            ),

            icon: <StatusIcon item={item} />,
            key: item.id,
            selectable: true,
            isLeaf: true,
          };
        })
        .filter(Boolean);
    }
    switch (from) {
      case 'datasource': {
        return allDatasources
          ?.map((item) => {
            if (
              (datasourceId && toInteger(datasourceId) !== item.id) ||
              (!datasourceId && item.temp)
            ) {
              return null;
            }
            const isNameMatched =
              !searchValue || item.name?.toLowerCase().includes(searchValue?.toLowerCase());
            const dbList = datasources
              .get(item.id)
              ?.databases?.filter((database) =>
                hasProjectIdFilter ? filters?.projectId === database?.project?.id : true,
              )
              ?.map((db) => {
                /**
                 * 父节点没匹配到，变更为搜索数据库
                 */
                if (
                  !isNameMatched &&
                  searchValue &&
                  !db.name?.toLowerCase().includes(searchValue?.toLowerCase())
                ) {
                  return null;
                }
                const disabled = taskType
                  ? !hasPermission(taskType, db.authorizedPermissionTypes)
                  : !db.authorizedPermissionTypes?.length;
                return {
                  title: <DatabasesTitle taskType={taskType} db={db} disabled={disabled} />,
                  key: `db:${db.id}`,
                  selectable: true,
                  isLeaf: true,
                  icon: <DataBaseStatusIcon item={db} />,
                  disabled,
                };
              })
              .filter(Boolean)
              .sort((a, b) => {
                if (a.disabled === b.disabled) return 0;
                return a.disabled ? 1 : -1;
              });
            if (!isNameMatched && !dbList?.length) {
              /**
               * 父节点没匹配到，并且也不存在子节点，则不展示
               */
              return null;
            }
            return {
              title: item.name,
              icon: <StatusIcon item={item} />,
              key: item.id,
              selectable: false,
              isLeaf: false,
              children: dbList,
            };
          })
          .filter(Boolean);
      }
      case 'project': {
        return allProjects
          ?.map((item) => {
            const isNameMatched =
              !searchValue || item.name?.toLowerCase().includes(searchValue?.toLowerCase());
            const dbList = projects
              .get(item.id)
              ?.databases?.filter((database) =>
                hasDialectTypesFilter
                  ? filters?.dialectTypes?.includes(database?.dataSource?.dialectType)
                  : true,
              )
              ?.map((db) => {
                if (
                  !isNameMatched &&
                  searchValue &&
                  !db.name?.toLowerCase().includes(searchValue?.toLowerCase())
                ) {
                  return null;
                }
                const disabled = taskType
                  ? !hasPermission(taskType, db.authorizedPermissionTypes)
                  : !db.authorizedPermissionTypes?.length;
                return {
                  title: <DatabasesTitle taskType={taskType} db={db} disabled={disabled} />,
                  key: `db:${db.id}`,
                  selectable: true,
                  isLeaf: true,
                  icon: <DataBaseStatusIcon item={db} />,
                  disabled,
                };
              })
              .filter(Boolean)
              .sort((a, b) => {
                if (a.disabled === b.disabled) return 0;
                return a.disabled ? 1 : -1;
              });
            if (!isNameMatched && !dbList?.length) {
              /**
               * 父节点没匹配到，并且也不存在子节点，则不展示
               */
              return null;
            }
            return {
              title: item.name,
              icon: (
                <Icon
                  component={PjSvg}
                  style={{
                    fontSize: 14,
                  }}
                />
              ),

              key: item.id,
              selectable: false,
              isLeaf: false,
              children: dbList,
            };
          })
          .filter(Boolean);
      }
    }
  }

  function TreeRender() {
    return (
      <Tree
        ref={treeRef}
        expandAction="click"
        className={styles.tree}
        key={from}
        onSelect={async (_, info) => {
          const key = info.node?.key?.toString();
          let dbId, dsId;
          if (context.datasourceMode) {
            dsId = toInteger(key);
          } else {
            dbId = toInteger(key?.replace('db:', ''));
          }
          setLoading(true);
          try {
            await context.selectSession(dbId, dsId, from);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
          setIsOpen(false);
        }}
        selectedKeys={[
          context?.datasourceMode ? context?.datasourceId : `db:${context?.databaseId}`,
        ].filter(Boolean)}
        height={215}
        expandedKeys={expandedKeys}
        onExpand={(expandedKeys) => {
          setExpandedKeys(expandedKeys);
        }}
        showIcon
        blockNode={true}
        treeData={treeData()}
      />
    );
  }

  return (
    <Popover
      trigger={['click']}
      placement="bottom"
      open={isOpen}
      showArrow={false}
      onOpenChange={onOpen}
      overlayStyle={{ paddingTop: 2 }}
      content={
        <Spin spinning={loading || fetchLoading}>
          <div className={styles.main} style={{ width }}>
            <Space.Compact block>
              {context?.datasourceMode || login.isPrivateSpace() ? null : (
                <Select
                  onChange={(v) => setFrom(v)}
                  value={from}
                  size="small"
                  style={{
                    width: '35%',
                  }}
                  options={[
                    {
                      label: formatMessage({
                        id: 'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.Project',
                      }), //'按项目'
                      value: 'project',
                    },
                    {
                      label: formatMessage({
                        id: 'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.DataSource',
                      }), //'按数据源'
                      value: 'datasource',
                    },
                  ]}
                />
              )}

              <Input
                size="small"
                value={searchValue}
                suffix={<SearchOutlined />}
                placeholder={
                  formatMessage({
                    id: 'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.SearchForTheKeyword',
                  }) /* 搜索关键字 */
                }
                onChange={(v) => setSearchValue(v.target.value)}
                style={{
                  width: context?.datasourceMode || login.isPrivateSpace() ? '100%' : '65%',
                }}
              />
            </Space.Compact>
            <div
              style={{
                height: '215px',
                marginTop: 10,
                overflow: 'hidden',
              }}
            >
              {TreeRender()}
            </div>
          </div>
        </Spin>
      }
    >
      {children}
    </Popover>
  );
};
export default inject('dataSourceStatusStore')(observer(SessionDropdown));
