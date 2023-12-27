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
import { ReactComponent as ProjectSvg } from '@/svgr/project_space.svg';
import tracert from '@/util/tracert';
import { ConnectionMode } from '@/d.ts';
import SessionContext from '../../context';
import { useRequest, useUpdate } from 'ahooks';
import { listProjects } from '@/common/network/project';
import { getConnectionList, getDataSourceGroupByProject } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import login from '@/store/login';
import { DataNode, EventDataNode } from 'antd/lib/tree';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { ReactComponent as PjSvg } from '@/svgr/project_space.svg';
import { IDatabase } from '@/d.ts/database';
import { toInteger } from 'lodash';
import { useParams } from '@umijs/max';
import { EnvColorMap } from '@/constant';
import ConnectionPopover from '@/component/ConnectionPopover';
import { IProject } from '@/d.ts/project';
import { IDatasource } from '@/d.ts/datasource';
import logger from '@/util/logger';
interface IProps {
  dialectTypes?: ConnectionMode[];
  containsUnassigned?: boolean;
}
const SessionDropdown: React.FC<IProps> = function ({ children, containsUnassigned = false }) {
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { datasourceId } = useParams<{
    datasourceId: string;
  }>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [from, setFrom] = useState<'project' | 'datasource'>('project');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  const update = useUpdate();
  const { run: fetchDatabase, refresh, data } = useRequest(listDatabases, {
    manual: false,
    defaultParams: [null, null, 1, 99999, null, null, containsUnassigned, true, null],
  });
  const dataGroup = useMemo(() => {
    const datasources: Map<number, { datasource: IDatasource; databases: IDatabase[] }> = new Map();
    const projects: Map<number, { project: IProject; databases: IDatabase[] }> = new Map();
    const allProjects: IProject[] = [],
      allDatasources: IDatasource[] = [];
    data?.contents?.forEach((db) => {
      const { project, dataSource } = db;
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

    return {
      datasources,
      projects,
      allDatasources,
      allProjects,
    };
  }, [data?.contents]);

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
            title: item.name,
            icon: (
              <Icon
                component={getDataSourceStyleByConnectType(item.type)?.icon?.component}
                style={{
                  fontSize: 14,
                  color: getDataSourceStyleByConnectType(item.type)?.icon?.color,
                }}
              />
            ),
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
              ?.databases?.map((db) => {
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
                return {
                  title: (
                    <>
                      {db.name}
                      <Badge color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor} />
                    </>
                  ),
                  key: `db:${db.id}`,
                  selectable: true,
                  isLeaf: true,
                  icon: (
                    <Icon
                      component={getDataSourceStyleByConnectType(item.type)?.dbIcon?.component}
                      style={{
                        fontSize: 14,
                        color: getDataSourceStyleByConnectType(item.type)?.icon?.color,
                      }}
                    />
                  ),
                };
              })
              .filter(Boolean);
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
                  component={getDataSourceStyleByConnectType(item.type)?.icon?.component}
                  style={{
                    fontSize: 14,
                    color: getDataSourceStyleByConnectType(item.type)?.icon?.color,
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
      case 'project': {
        return allProjects
          ?.map((item) => {
            const isNameMatched =
              !searchValue || item.name?.toLowerCase().includes(searchValue?.toLowerCase());
            const dbList = projects
              .get(item.id)
              ?.databases?.map((db) => {
                if (
                  !isNameMatched &&
                  searchValue &&
                  !db.name?.toLowerCase().includes(searchValue?.toLowerCase())
                ) {
                  return null;
                }
                return {
                  title: (
                    <>
                      <Popover
                        showArrow={false}
                        content={<ConnectionPopover connection={db?.dataSource} />}
                        placement={'left'}
                      >
                        {db.name}
                      </Popover>
                      <Badge color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor} />
                    </>
                  ),
                  key: `db:${db.id}`,
                  selectable: true,
                  isLeaf: true,
                  icon: (
                    <Icon
                      component={
                        getDataSourceStyleByConnectType(db?.dataSource?.type)?.dbIcon?.component
                      }
                      style={{
                        fontSize: 14,
                        color: getDataSourceStyleByConnectType(db?.dataSource?.type)?.icon?.color,
                      }}
                    />
                  ),
                };
              })
              .filter(Boolean);
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

  return (
    <Popover
      trigger={['click']}
      placement="bottom"
      open={isOpen}
      showArrow={false}
      onOpenChange={onOpen}
      overlayStyle={{ paddingTop: 2 }}
      content={
        <Spin spinning={loading}>
          <div className={styles.main}>
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
                        id:
                          'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.Project',
                      }), //'按项目'
                      value: 'project',
                    },
                    {
                      label: formatMessage({
                        id:
                          'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.DataSource',
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
                    id:
                      'odc.src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.SearchForTheKeyword',
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
              <Tree
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
                showIcon
                treeData={treeData()}
              />
            </div>
          </div>
        </Spin>
      }
    >
      {children}
    </Popover>
  );
};
export default SessionDropdown;
