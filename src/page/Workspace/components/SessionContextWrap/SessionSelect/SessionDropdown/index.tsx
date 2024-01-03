/*
 * Copyright 2024 OceanBase
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
interface IProps {
  dialectTypes?: ConnectionMode[];
}
const SessionDropdown: React.FC<IProps> = function ({ children }) {
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { datasourceId } = useParams<{
    datasourceId: string;
  }>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [from, setFrom] = useState<'project' | 'datasource'>('project');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [loadedKeys, setLoadedKeys] = useState<Key[]>([]);
  const databaseRef = useRef<Record<string, IDatabase[]>>({});
  const treeRef = useRef<{
    scrollTo: (node: {
      key: string | number;
      align?: 'top' | 'bottom' | 'auto';
      offset?: number;
    }) => void;
  }>();
  const update = useUpdate();
  const { data: project, loading: projectLoading, run: fetchProjects } = useRequest(listProjects, {
    manual: true,
  });
  const { data: datasourceList, loading: datasourceLoading, run: fetchDatasource } = useRequest(
    getDataSourceGroupByProject,
    {
      manual: true,
    },
  );
  const {
    data: allDatasourceList,
    loading: allDatasourceLoading,
    run: fetchAllDatasource,
  } = useRequest(getConnectionList, {
    manual: true,
  });
  const { run: fetchDatabase } = useRequest(listDatabases, {
    manual: true,
  });
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
    setLoadedKeys([]);
    if (context.datasourceMode) {
      /**
       * datasourceMode
       */
      fetchAllDatasource({
        size: 9999,
        page: 1,
        minPrivilege: 'update',
      });
      return;
    }

    const session = context?.session;
    const projectId = session?.odcDatabase?.project?.id;
    const datasourceId = session?.odcDatabase?.dataSource?.id;
    switch (from) {
      case 'datasource': {
        await fetchDatasource(login.isPrivateSpace());
        if (session) {
          setExpandedKeys([datasourceId]);
          treeRef.current?.scrollTo({
            key: datasourceId,
            align: 'top',
          });
        }
        return;
      }
      case 'project': {
        fetchProjects(null, 1, 9999, false);
        if (session) {
          setExpandedKeys([projectId]);
          treeRef.current?.scrollTo({
            key: projectId,
            align: 'top',
          });
        }
        return;
      }
    }
  }
  function treeData(): DataNode[] {
    if (context?.datasourceMode) {
      return allDatasourceList?.contents
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
        return datasourceList?.contents
          ?.map((item) => {
            if (
              (datasourceId && toInteger(datasourceId) !== item.id) ||
              (!datasourceId && item.temp)
            ) {
              return null;
            }
            const dbList = databaseRef.current[`ds:${item.id}`];
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
              children: dbList
                ?.map((db) => {
                  if (searchValue && !db.name?.toLowerCase().includes(searchValue?.toLowerCase())) {
                    return null;
                  }
                  return {
                    title: (
                      <>
                        {db.name}
                        <Badge
                          color={EnvColorMap[db?.environment?.style?.toUpperCase()]?.tipColor}
                        />
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
                .filter(Boolean),
            };
          })
          .filter(Boolean);
      }
      case 'project': {
        return project?.contents?.map((item) => {
          const dbList = databaseRef.current[`p:${item.id}`];
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
            children: dbList
              ?.map((db) => {
                if (searchValue && !db.name?.toLowerCase().includes(searchValue?.toLowerCase())) {
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
              .filter(Boolean),
          };
        });
      }
    }
  }

  async function loadDataBase(key: Key) {
    switch (from) {
      case 'datasource': {
        const data = await fetchDatabase(null, toInteger(key), 1, 9999, null, null, null, true);
        if (data) {
          databaseRef.current = {
            ...databaseRef.current,
            [`ds:${key}`]: data?.contents,
          };
        }
        return;
      }
      case 'project': {
        const data = await fetchDatabase(toInteger(key), null, 1, 9999, null, null, null, true);
        if (data) {
          databaseRef.current = {
            ...databaseRef.current,
            [`p:${key}`]: data?.contents,
          };
        }
        return;
      }
    }
  }
  async function loadData(node: EventDataNode<DataNode>) {
    const key = node.key;
    await loadDataBase(key);
    update();
  }
  useEffect(() => {
    reloadTree();
  }, [from]);
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
                //@ts-ignore
                ref={treeRef}
                expandAction="click"
                className={styles.tree}
                key={from}
                onSelect={async (_, info) => {
                  const key = info.node?.key?.toString();
                  let dbId, dsId;
                  if (context.datasourceMode) {
                    dsId = key;
                  } else {
                    dbId = key?.replace('db:', '');
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
                loadData={loadData}
                height={215}
                showIcon
                treeData={treeData()}
                expandedKeys={expandedKeys}
                loadedKeys={loadedKeys}
                onExpand={(expandedKeys, { expanded, node }) => {
                  if (!expanded || loadedKeys.includes(node.key)) {
                    setExpandedKeys(expandedKeys);
                    return;
                  }
                }}
                onLoad={(loadedKeys, { node }) => {
                  setLoadedKeys(loadedKeys);
                  setExpandedKeys([...expandedKeys, node.key]);
                }}
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
