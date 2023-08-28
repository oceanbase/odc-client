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

import Action from '@/component/Action';
import { IDatabase } from '@/d.ts/database';
import { SessionManagerStore } from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import { Input, Tree } from 'antd';
import { EventDataNode } from 'antd/lib/tree';
import { throttle } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadNode } from './helper';
import styles from './index.less';
import { DataBaseTreeData } from './Nodes/database';
import TreeNodeMenu from './TreeNodeMenu';
import { ResourceNodeType, TreeDataNode } from './type';
import tracert from '@/util/tracert';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  databases: IDatabase[];
  reloadDatabase: () => void;
  title: string;
  databaseFrom: 'datasource' | 'project';
  showTip?: boolean;
}

const ResourceTree: React.FC<IProps> = function ({
  sessionManagerStore,
  databases,
  title,
  databaseFrom,
  reloadDatabase,
  showTip = false,
}) {
  const [databaseSessions, setDatabaseSessions] = useState<Record<string, string>>({});
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const treeWrapperRef = useRef<HTMLDivElement>();
  useEffect(() => {
    tracert.expo('a3112.b41896.c330992');
  }, []);
  useEffect(() => {
    const resizeHeight = throttle(() => {
      setWrapperHeight(treeWrapperRef?.current?.offsetHeight);
    }, 500);
    setWrapperHeight(treeWrapperRef.current?.clientHeight);
    window.addEventListener('resize', resizeHeight);
    return () => {
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);

  const treeData: TreeDataNode[] = (() => {
    const root = databases
      ?.filter((db) => db.existed)
      ?.map((database) => {
        const dbId = database.id;
        const dbSessionId = databaseSessions[dbId];
        const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
        return DataBaseTreeData(dbSession, database, database?.id);
      });
    return root || [];
  })();

  const filteredTreeData = useMemo(() => {
    if (!searchValue || !searchValue?.trim()) {
      return treeData;
    }
    return treeData.filter((dbNode) => {
      let haveObj = false;
      const isDBNameMatch = dbNode.title
        ?.toString()
        ?.toLowerCase()
        ?.includes(searchValue?.toLowerCase());
      if (isDBNameMatch) {
        /**
         * db 名字匹配的情况下，不做内部的过滤
         */
        return true;
      }
      dbNode.children?.forEach((objRootNode: TreeDataNode) => {
        /**
         * 过滤数据库对象
         */
        let filterChildren: any = objRootNode.children?.filter((objNode) => {
          return objNode.title?.toString()?.toLowerCase()?.includes(searchValue?.toLowerCase());
        });
        objRootNode.children = filterChildren;
        if (filterChildren?.length) {
          haveObj = true;
        }
      });
      return haveObj;
    });
  }, [treeData, searchValue]);

  const loadData = useCallback(
    async (treeNode: EventDataNode<any> & TreeDataNode) => {
      console.log('load');
      const { type, data } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbId = (data as IDatabase).id;
          const dbSession = await sessionManagerStore.createSession(null, data?.id);
          setDatabaseSessions({
            ...databaseSessions,
            [dbId]: dbSession.sessionId,
          });
          break;
        }
        default: {
          await loadNode(sessionManagerStore, treeNode);
        }
      }
    },
    [databaseSessions],
  );

  const renderNode = useCallback(
    (node: TreeDataNode): React.ReactNode => {
      const { type, sessionId, key, dbObjectType } = node;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);

      return (
        <TreeNodeMenu
          showTip={showTip}
          node={node}
          dbSession={dbSession}
          type={type}
          databaseFrom={databaseFrom}
        />
      );
    },
    [databaseSessions],
  );

  return (
    <div className={styles.resourceTree}>
      <div className={styles.title}>
        <span className={styles.label}>{title}</span>
        <span>
          <Action.Group size={0} ellipsisIcon="vertical">
            <Action.Link
              key={'reload'}
              onClick={() => {
                reloadDatabase();
              }}
            >
              {
                formatMessage({
                  id: 'odc.SideBar.ResourceTree.RefreshTheDatabaseList',
                }) /*刷新数据库列表*/
              }
            </Action.Link>
          </Action.Group>
        </span>
      </div>
      <div className={styles.search}>
        <Input.Search
          onSearch={(v) => setSearchValue(v)}
          size="small"
          placeholder={formatMessage({
            id: 'odc.SideBar.ResourceTree.SearchForLoadedObjects',
          })} /*搜索已加载对象*/
        />
      </div>
      <div ref={treeWrapperRef} className={styles.tree}>
        <Tree
          expandAction="click"
          showIcon
          onExpand={(_, info) => {
            tracert.click('a3112.b41896.c330992.d367628', { resourceType: info?.node?.type });
          }}
          filterTreeNode={(node) =>
            node.title.toString().toLowerCase().includes(searchValue?.toLowerCase())
          }
          treeData={filteredTreeData}
          titleRender={renderNode}
          loadData={loadData}
          height={wrapperHeight}
          selectable={false}
        />
      </div>
    </div>
  );
};

export default inject('sessionManagerStore')(observer(ResourceTree));
