import { IDatabase } from '@/d.ts';
import { SessionManagerStore } from '@/store/sessionManager';
import { Tree } from 'antd';
import { EventDataNode } from 'antd/lib/tree';
import { throttle } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { loadNode } from './helper';
import styles from './index.less';
import { DataBaseTreeData } from './Nodes/database';
import TreeNodeMenu from './TreeNodeMenu';
import { ResourceNodeType, TreeDataNode } from './type';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
}

const ResourceTree: React.FC<IProps> = function ({ sessionManagerStore }) {
  const [databaseSessions, setDatabaseSessions] = useState<Record<string, string>>({});
  const session = sessionManagerStore?.getMasterSession();
  const databases = session?.databases;
  const [wrapperHeight, setWrapperHeight] = useState(0);
  const treeWrapperRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const resizeHeight = throttle(() => {
      setWrapperHeight(treeWrapperRef?.current?.offsetHeight - 24);
    }, 500);
    setWrapperHeight(treeWrapperRef.current?.clientHeight - 24);
    window.addEventListener('resize', resizeHeight);
    return () => {
      window.removeEventListener('resize', resizeHeight);
    };
  }, []);

  const treeData: TreeDataNode[] = (() => {
    if (!session) {
      return [];
    }
    // const root: TreeDataNode[] = {
    //   title: session.connection.name,
    //   key: 'connection' + session.connection.id,
    //   type: ResourceNodeType.Connection,
    //   icon: <DisconnectOutlined style={{ color: '#3FA3FF' }} />,
    //   children: databases?.map((database) => {
    //     const dbName = database.name;
    //     const dbSessionId = databaseSessions[dbName];
    //     const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
    //     return DataBaseTreeData(dbSession, database);
    //   }),
    // };
    const root = databases?.map((database) => {
      const dbName = database.name;
      const dbSessionId = databaseSessions[dbName];
      const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
      return DataBaseTreeData(dbSession, database, session?.connection?.id);
    });
    return root || [];
  })();

  const loadData = useCallback(
    async (treeNode: EventDataNode & TreeDataNode) => {
      const { type, data } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbName = (data as IDatabase).name;
          const dbSession = await sessionManagerStore.createSession(
            false,
            session?.connection?.id,
            dbName,
            true,
          );
          setDatabaseSessions({
            ...databaseSessions,
            [dbName]: dbSession.sessionId,
          });
          break;
        }
        default: {
          await loadNode(sessionManagerStore, treeNode);
        }
      }
    },
    [session, databaseSessions],
  );

  const renderNode = useCallback(
    (node: TreeDataNode): React.ReactNode => {
      const { type, sessionId } = node;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);

      return <TreeNodeMenu node={node} dbSession={dbSession} type={type} />;
    },
    [databaseSessions],
  );

  return (
    <div ref={treeWrapperRef} className={styles.resourceTree}>
      <Tree
        defaultExpandedKeys={
          session?.connection?.id ? [`connection${session?.connection?.id}`] : []
        }
        showIcon
        treeData={treeData}
        titleRender={renderNode}
        loadData={loadData}
        height={wrapperHeight}
        selectable={false}
      />
    </div>
  );
};

export default inject('sessionManagerStore')(observer(ResourceTree));
