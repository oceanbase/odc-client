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

import { IDatabase } from '@/d.ts/database';
import { SessionManagerStore } from '@/store/sessionManager';
import { Input, Space, Tree } from 'antd';
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
import { useUpdate } from 'ahooks';
import Icon, { DownOutlined } from '@ant-design/icons';
import Reload from '@/component/Button/Reload';
import DatasourceFilter from './DatasourceFilter';
import { ConnectType, DbObjectType } from '@/d.ts';
import useTreeState from './useTreeState';
import DatabaseSearch from './DatabaseSearch';
import { useParams } from '@umijs/max';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  databases: IDatabase[];
  reloadDatabase: () => void;
  title: React.ReactNode;
  databaseFrom: 'datasource' | 'project';
  showTip?: boolean;
  enableFilter?: boolean;
  stateId?: string;
  onTitleClick?: () => void;
}

const ResourceTree: React.FC<IProps> = function ({
  sessionManagerStore,
  databases,
  title,
  databaseFrom,
  onTitleClick,
  reloadDatabase,
  showTip = false,
  enableFilter,
  stateId,
}) {
  const { expandedKeys, loadedKeys, sessionIds, setSessionId, onExpand, onLoad } = useTreeState(
    stateId,
  );
  const { tabKey } = useParams<{ tabKey: string }>();
  const update = useUpdate();
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const [searchValue, setSearchValue] = useState<{
    type: DbObjectType;
    value: string;
  }>(null);

  const [envs, setEnvs] = useState<number[]>([]);
  const [connectTypes, setConnectTypes] = useState<ConnectType[]>([]);
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
      ?.filter((db) => {
        if (
          searchValue?.type === DbObjectType.database &&
          !db.name.toLowerCase()?.includes(searchValue?.value)
        ) {
          /**
           * search filter
           */
          return false;
        }
        return (
          db.existed &&
          !(envs?.length && !envs.includes(db.environment?.id)) &&
          !(connectTypes?.length && !connectTypes.includes(db.dataSource?.type))
        );
      })
      ?.map((database) => {
        const dbId = database.id;
        const dbSessionId = sessionIds[dbId];
        const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
        return DataBaseTreeData(dbSession, database, database?.id, true, searchValue);
      });
    return root || [];
  })();

  const loadData = useCallback(
    async (treeNode: EventDataNode<any> & TreeDataNode) => {
      console.log('loaddata', treeNode.key);
      const { type, data } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbId = (data as IDatabase).id;
          const dbSession =
            sessionManagerStore.sessionMap.get(sessionIds[dbId]) ||
            (await sessionManagerStore.createSession(null, data?.id, true));
          if (dbSession !== 'NotFound') {
            setSessionId(dbId, dbSession?.sessionId);
            update();
          }
          break;
        }
        default: {
          await loadNode(sessionManagerStore, treeNode);
        }
      }
      console.log('loaddata-end', treeNode.key);
    },
    [sessionIds],
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
    [sessionIds],
  );

  return (
    <div className={styles.resourceTree}>
      <div className={styles.title}>
        {tabKey ? (
          <Space size={2} className={styles.label}>
            {title}
          </Space>
        ) : (
          <Space size={2} onClick={() => onTitleClick?.()} className={styles.label}>
            {title}
            <Icon style={{ verticalAlign: 'text-bottom' }} component={DownOutlined} />
          </Space>
        )}
        <span className={styles.titleAction}>
          <Space size={4}>
            {enableFilter ? (
              <DatasourceFilter
                envs={envs}
                types={connectTypes}
                onClear={() => {
                  setEnvs([]);
                  setConnectTypes([]);
                }}
                onEnvsChange={(v) => {
                  setEnvs(v);
                }}
                onTypesChange={(v) => {
                  setConnectTypes(v);
                }}
                iconStyle={{ verticalAlign: 'text-bottom' }}
              />
            ) : null}
            <Reload
              onClick={() => {
                return reloadDatabase();
              }}
            />
          </Space>
        </span>
      </div>
      <div className={styles.search}>
        <DatabaseSearch
          onChange={(type, value) => {
            !type
              ? setSearchValue(null)
              : setSearchValue({
                  type,
                  value,
                });
          }}
        />
      </div>
      <div ref={treeWrapperRef} className={styles.tree}>
        <Tree
          expandAction="click"
          showIcon
          onExpand={(_, info) => {
            onExpand(_, info);
            //@ts-ignore
            tracert.click('a3112.b41896.c330992.d367628', { resourceType: info?.node?.type });
          }}
          treeData={treeData}
          titleRender={renderNode}
          loadData={loadData}
          expandedKeys={expandedKeys}
          loadedKeys={loadedKeys}
          onLoad={onLoad}
          height={wrapperHeight}
          selectable={false}
        />
      </div>
    </div>
  );
};

export default inject('sessionManagerStore')(observer(ResourceTree));
