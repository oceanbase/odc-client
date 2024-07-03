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

export async function loadNode(
  sessionManagerStore: SessionManagerStore,
  treeNode: EventDataNode<TreeDataNode>,
) {
  const { type, data, sessionId, packageName } = treeNode;
  switch (type) {
    case ResourceNodeType.TableRoot: {
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.getTableList();
      break;
    }
    case ResourceNodeType.Table: {
      const tableInfo = (data as ITableModel).info;
      const dbSession = sessionManagerStore.sessionMap.get(sessionId);
      if (!dbSession) {
        break;
      }
      await dbSession.database.loadTable(tableInfo);
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
