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

import { IFunction, IPackage, IProcedure, IType, IView } from '@/d.ts';
import { SessionManagerStore } from '@/store/sessionManager';
import { EventDataNode } from 'antd/lib/tree';
import { ITableModel } from '../../components/CreateTable/interface';
import { ResourceNodeType, TreeDataNode } from './type';
import { isLogicalDatabase } from '@/util/database';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { ConnectType } from '@/d.ts';

export async function loadNode(
  sessionManagerStore: SessionManagerStore,
  treeNode: EventDataNode<TreeDataNode>,
) {
  const { type, data, sessionId, packageName } = treeNode;
  // 是否为外表
  const isExternalTable = [
    ResourceNodeType.ExternalTableRoot,
    ResourceNodeType.ExternalTable,
    ResourceNodeType.ExternalTableColumnRoot,
  ].includes(type);
  switch (type) {
    case ResourceNodeType.GroupNodeProject:
    case ResourceNodeType.GroupNodeCluster:
    case ResourceNodeType.GroupNodeConnectType:
    case ResourceNodeType.GroupNodeEnviponment:
    case ResourceNodeType.GroupNodeTenant:
    case ResourceNodeType.GroupNodeDataSource:
    case ResourceNodeType.SecondGroupNodeDataSource: {
      break;
    }
    case ResourceNodeType.TableRoot:
    case ResourceNodeType.ExternalTableRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      if (isLogicalDatabase(dbSession?.odcDatabase)) {
        await dbSession.database.getLogicTableList();
        break;
      }
      await dbSession.database.getTableList(isExternalTable);
      break;
    }
    case ResourceNodeType.Table:
    case ResourceNodeType.ExternalTable: {
      const tableInfo = (data as ITableModel).info;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.loadTable(tableInfo, isExternalTable);
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
    // trigger
    case ResourceNodeType.TriggerRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getTriggerList();
      break;
    }
    // sequence
    case ResourceNodeType.SequenceRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getSequenceList();
      break;
    }
    // synonym
    case ResourceNodeType.SynonymRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getSynonymList();
      break;
    }
    // public synonym
    case ResourceNodeType.PublicSynonymRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getPublicSynonymList();
      break;
    }
    //type
    case ResourceNodeType.TypeRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getTypeList();
      break;
    }
    case ResourceNodeType.Type: {
      const typeName = (data as IType).typeName;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.loadType(typeName);
      break;
    }
  }
}

export type GroupResult = {
  [DatabaseGroup.project]: { mapId: number; groupName: string };
  [DatabaseGroup.environment]: { mapId: number; groupName: string };
  [DatabaseGroup.dataSource]: { mapId: number; groupName: string };
  [DatabaseGroup.connectType]: { mapId: ConnectType; groupName: string };
  [DatabaseGroup.cluster]: { mapId: string; groupName: string };
  [DatabaseGroup.tenant]: { mapId: string; groupName: string };
  [DatabaseGroup.none]: undefined;
};
export type secondGroupType = Map<number, GroupWithDatabases[DatabaseGroup.dataSource]>;

export type GroupWithDatabases = {
  [K in keyof GroupResult as K extends DatabaseGroup.none ? never : K]: GroupResult[K] & {
    databases: IDatabase[];
  };
};
export type GroupWithSecondGroup = {
  [K in keyof GroupResult as K extends DatabaseGroup.none ? never : K]: GroupResult[K] & {
    secondGroup: secondGroupType;
  };
};

/** 获取 db 分组信息 */
export const getMapIdByDB = <T extends DatabaseGroup>(db: IDatabase, type: T): GroupResult[T] => {
  if (!db || !type) return;
  const { environment, dataSource, connectType, project } = db;
  const { clusterName, tenantName } = dataSource || {};
  let mapId, groupName;
  switch (type) {
    case DatabaseGroup.project: {
      mapId = project?.id;
      groupName = project?.name;
      break;
    }
    case DatabaseGroup.environment: {
      mapId = environment?.id;
      groupName = environment?.name;
      break;
    }
    case DatabaseGroup.dataSource: {
      mapId = dataSource?.id;
      groupName = dataSource?.name;
      if (db.type === 'LOGICAL') {
        // 逻辑库特殊处理
        mapId = 0;
        groupName = '逻辑库';
      }
      break;
    }
    case DatabaseGroup.connectType: {
      mapId = connectType;
      groupName = connectType;
      break;
    }
    case DatabaseGroup.cluster: {
      mapId = clusterName || '无集群';
      groupName = clusterName || '无集群';
      break;
    }
    case DatabaseGroup.tenant: {
      mapId = tenantName && clusterName ? `${tenantName}@${clusterName}` : '无租户';
      groupName = tenantName && clusterName ? `${tenantName}@${clusterName}` : '无租户';
      break;
    }
    case DatabaseGroup.none: {
      return undefined;
    }
  }
  return {
    mapId,
    groupName,
  } as GroupResult[T];
};
