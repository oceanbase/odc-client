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

import { DbObjectType, IPackage, IProcedure } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import Icon, { InfoOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { TopTab } from '@/page/Workspace/components/PackagePage';
import { ReactComponent as ParameterSvg } from '@/svgr/Parameter.svg';
import { IDatabase } from '@/d.ts/database';
import { openPackageViewPage, openProcedureViewPage } from '@/store/helper/page';
import { ReactComponent as ProcedureSvg } from '@/svgr/menuProcedure.svg';

const THEME = 'var(--icon-color-2)';

export function ProcedureTreeNodeData(
  proc: Partial<IProcedure>,
  dbSession: SessionStore,
  dbName: string,
  packageName?: string,
  menuKey?: ResourceNodeType,
  pkg?: Partial<IPackage>,
  index?: number,
): TreeDataNode {
  const funcKey = `${dbSession?.database?.databaseId}-${dbName}-procedure-${packageName}-${proc.proName}-index:${index}`;
  let paramRoot: TreeDataNode;
  let variableRoot: TreeDataNode;

  if (proc.params?.length) {
    paramRoot = {
      title: formatMessage({
        id: 'odc.ResourceTree.Nodes.procedure.Parameter',
        defaultMessage: '参数',
      }), //参数
      key: `${funcKey}-param`,
      type: ResourceNodeType.ProcedureParamRoot,
      icon: (
        <Icon
          component={ParameterSvg}
          style={{
            color: THEME,
          }}
        />
      ),

      children: proc.params.map((p) => {
        return {
          title: p.paramName,
          key: `${funcKey}-param-${p.paramName}${p.seqNum}`,
          type: ResourceNodeType.ProcedureParam,
          isLeaf: true,
        };
      }),
    };
  }

  if (proc.variables?.length) {
    variableRoot = {
      title: formatMessage({
        id: 'odc.ResourceTree.Nodes.procedure.Variable',
        defaultMessage: '变量',
      }), //变量
      key: `${funcKey}-variable`,
      icon: (
        <InfoOutlined
          style={{
            color: THEME,
          }}
        />
      ),

      type: ResourceNodeType.ProcedureVariableRoot,
      children: proc.variables.map((p) => {
        return {
          title: p.varName,
          key: `${funcKey}-variable-${p.varName}${p.varType}`,
          type: ResourceNodeType.ProcedureVariable,
          isLeaf: true,
        };
      }),
    };
  }

  return {
    title: proc.proName,
    key: funcKey,
    type: ResourceNodeType.Procedure,
    menuKey,
    dbObjectType: DbObjectType.procedure,
    warning: proc.status === 'INVALID' ? proc.errorMessage : null,
    pkg,
    icon: (
      <Icon
        component={ProcedureSvg}
        style={{
          color: THEME,
        }}
      />
    ),

    doubleClick(session, node) {
      // 程序包中的子程序 双击直接打开所在的程序包详情
      switch (menuKey) {
        case ResourceNodeType.PackageHeadProcedure: {
          openPackageViewPage(pkg.packageName, TopTab.HEAD, false, session?.database?.databaseId);
          break;
        }
        case ResourceNodeType.PackageBodyProcedure: {
          openPackageViewPage(pkg.packageName, TopTab.BODY, false, session?.database?.databaseId);
          break;
        }
        default: {
          openProcedureViewPage(
            proc.proName,
            undefined,
            undefined,
            session?.database?.databaseId,
            null,
          );
        }
      }
    },
    sessionId: dbSession?.sessionId,
    packageName: packageName,
    data: proc,
    isLeaf: false,
    children: [paramRoot, variableRoot].filter(Boolean),
  };
}

export function ProcedureTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  packageName: string = '',
): TreeDataNode {
  const dbName = database.name;
  const procedures = dbSession?.database?.procedures;
  const treeData: TreeDataNode = {
    title: formatMessage({
      id: 'odc.ResourceTree.Nodes.procedure.StoredProcedure',
      defaultMessage: '存储过程',
    }), //存储过程
    key: `${database.id}-${dbName}-procedure`,
    type: ResourceNodeType.ProcedureRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };

  if (procedures?.length) {
    treeData.children = procedures.map((proc, index) => {
      return ProcedureTreeNodeData(proc, dbSession, dbName, packageName, null, null, index);
    });
  }
  return treeData;
}
