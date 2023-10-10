import { Input, Popover, Select, Space, Tree } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';

import styles from './index.less';
import Icon, { SearchOutlined } from '@ant-design/icons';
import ProjectSvg from '@/svgr/project_space.svg';
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
import PjSvg from '@/svgr/project_space.svg';
import { IDatabase } from '@/d.ts/database';
import { toInteger } from 'lodash';

interface IProps {
  dialectTypes?: ConnectionMode[];
}

const SessionDropdown: React.FC<IProps> = function ({ children }) {
  const context = useContext(SessionContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [from, setFrom] = useState<'project' | 'datasource'>('project');
  const databaseRef = useRef<Record<string, IDatabase[]>>({});

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
    switch (from) {
      case 'datasource': {
        fetchDatasource(login.isPrivateSpace());
        return;
      }
      case 'project': {
        fetchProjects(null, 1, 9999, false);
        return;
      }
    }
  }

  function treeData(): DataNode[] {
    if (context?.datasourceMode) {
      return allDatasourceList?.contents?.map((item) => {
        return {
          title: item.name,
          icon: (
            <Icon
              component={getDataSourceStyleByConnectType(item.type)?.icon?.component}
              style={{ fontSize: 14 }}
            />
          ),
          key: item.id,
          selectable: true,
          isLeaf: true,
        };
      });
    }
    switch (from) {
      case 'datasource': {
        return datasourceList?.contents?.map((item) => {
          const dbList = databaseRef.current[`ds:${item.id}`];
          return {
            title: item.name,
            icon: (
              <Icon
                component={getDataSourceStyleByConnectType(item.type)?.icon?.component}
                style={{ fontSize: 14 }}
              />
            ),
            key: item.id,
            selectable: false,
            isLeaf: false,
            children: dbList?.map((db) => {
              return {
                title: db.name,
                key: `db:${db.id}`,
                selectable: true,
                isLeaf: true,
                icon: (
                  <Icon
                    component={getDataSourceStyleByConnectType(item.type)?.dbIcon?.component}
                    style={{ fontSize: 14 }}
                  />
                ),
              };
            }),
          };
        });
      }
      case 'project': {
        return project?.contents?.map((item) => {
          const dbList = databaseRef.current[`p:${item.id}`];
          return {
            title: item.name,
            icon: <Icon component={PjSvg} style={{ fontSize: 14 }} />,
            key: item.id,
            selectable: false,
            isLeaf: false,
            children: dbList?.map((db) => {
              return {
                title: db.name,
                key: `db:${db.id}`,
                selectable: true,
                isLeaf: true,
                icon: (
                  <Icon
                    component={
                      getDataSourceStyleByConnectType(db?.dataSource?.type)?.dbIcon?.component
                    }
                    style={{ fontSize: 14 }}
                  />
                ),
              };
            }),
          };
        });
      }
    }
  }

  async function loadData(node: EventDataNode<DataNode>) {
    const key = node.key;
    switch (from) {
      case 'datasource': {
        const data = await fetchDatabase(null, toInteger(key), 1, 9999, null, null, null, true);
        if (data) {
          databaseRef.current = {
            ...databaseRef.current,
            [`ds:${key}`]: data?.contents,
          };
          update();
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
          update();
        }
        return;
      }
    }
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
      content={
        <div className={styles.main}>
          <Space.Compact block>
            <Select
              onChange={(v) => setFrom(v)}
              value={from}
              size="small"
              style={{ width: '96px' }}
              options={[
                {
                  label: '按项目',
                  value: 'project',
                },
                {
                  label: '按数据源',
                  value: 'datasource',
                },
              ]}
            />
            <Input
              size="small"
              suffix={<SearchOutlined />}
              placeholder="搜索关键字"
              style={{ width: '192px' }}
            />
          </Space.Compact>
          <Tree
            key={from}
            onSelect={async (_, info) => {
              const key = info.node?.key?.toString();
              let dbId, dsId;
              if (context.datasourceMode) {
                dsId = key;
              } else {
                dbId = key?.replace('db:', '');
              }
              await context.selectSession(dbId, dsId, from);
              setIsOpen(false);
            }}
            activeKey={
              context?.datasourceMode ? context?.datasourceId : `db:${context?.databaseId}`
            }
            loadData={loadData}
            style={{ marginTop: 10 }}
            height={215}
            showIcon
            treeData={treeData()}
          />
        </div>
      }
    >
      {children}
    </Popover>
  );
};

export default SessionDropdown;
