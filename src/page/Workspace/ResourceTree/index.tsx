import { IDatabase, IFunction, IPackage, IProcedure, IView } from '@/d.ts';
import { SessionManagerStore } from '@/store/sessionManager';
import { DisconnectOutlined } from '@ant-design/icons';
import { Tree } from 'antd';
import { EventDataNode } from 'antd/lib/tree';
import { throttle } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ITableModel } from '../components/CreateTable/interface';
import styles from './index.less';
import { DataBaseTreeData } from './Nodes/database';
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
    const root: TreeDataNode = {
      title: session.connection.name,
      key: 'connection' + session.connection.id,
      type: ResourceNodeType.Connection,
      icon: <DisconnectOutlined style={{ color: '#3FA3FF' }} />,
      children: databases?.map((database) => {
        const dbName = database.name;
        const dbSessionId = databaseSessions[dbName];
        const dbSession = sessionManagerStore.sessionMap.get(dbSessionId);
        return DataBaseTreeData(dbSession, database);
      }),
    };
    return [root];
  })();

  const loadData = useCallback(
    async (treeNode: EventDataNode & TreeDataNode) => {
      const { type, data, sessionId, packageName } = treeNode;
      switch (type) {
        case ResourceNodeType.Database: {
          const dbName = (data as IDatabase).name;
          const dbSession = await sessionManagerStore.createSession(
            false,
            session?.connection?.id,
            dbName,
          );
          setDatabaseSessions({
            ...databaseSessions,
            [dbName]: dbSession.sessionId,
          });
          break;
        }
        case ResourceNodeType.TableRoot: {
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.getTableList();
          break;
        }
        case ResourceNodeType.Table: {
          const tableName = (data as ITableModel).info.tableName;
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.loadTable(tableName);
          break;
        }
        case ResourceNodeType.ViewRoot: {
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.getViewList();
          break;
        }
        case ResourceNodeType.View: {
          const viewName = (data as IView).viewName;
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.loadView(viewName);
          break;
        }
        case ResourceNodeType.FunctionRoot: {
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.getFunctionList();
          break;
        }
        case ResourceNodeType.Function: {
          const funcName = (data as IFunction).funName;
          if (packageName) {
            /**
             * skip pkg
             */
            return;
          }
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.loadFunction(funcName);
          break;
        }
        case ResourceNodeType.ProcedureRoot: {
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.getProcedureList();
          break;
        }
        case ResourceNodeType.Procedure: {
          const proName = (data as IProcedure).proName;
          if (packageName) {
            /**
             * skip pkg
             */
            return;
          }
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.loadProcedure(proName);
          break;
        }
        case ResourceNodeType.PackageRoot: {
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.getPackageList();
          break;
        }
        case ResourceNodeType.Package: {
          const packageName = (data as IPackage).packageName;
          const dbSession = sessionManagerStore.sessionMap.get(sessionId);
          if (!dbSession) {
            break;
          }
          await dbSession.database.loadPackage(packageName);
          break;
        }
      }
    },
    [session, databaseSessions],
  );

  return (
    <div ref={treeWrapperRef} className={styles.resourceTree}>
      <Tree
        defaultExpandedKeys={
          session?.connection?.id ? [`connection${session?.connection?.id}`] : []
        }
        showIcon
        treeData={treeData}
        loadData={loadData}
        height={wrapperHeight}
        selectable={false}
      />
    </div>
  );
};

export default inject('sessionManagerStore')(observer(ResourceTree));
