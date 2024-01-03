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

import { DbObjectType, IFunction, IPackage } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';

import Icon, { InfoOutlined, NumberOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

import { ReactComponent as ParameterSvg } from '@/svgr/Parameter.svg';

import { IDatabase } from '@/d.ts/database';
import { ReactComponent as FunctionSvg } from '@/svgr/menuFunc.svg';
import {
  openFunctionViewPage,
  openPackageHeadPage,
  openPackageViewPage,
} from '@/store/helper/page';

const THEME = 'var(--icon-color-2)';

export function FunctionTreeNodeData(
  func: Partial<IFunction>,
  dbSession: SessionStore,
  dbName: string,
  packageName?: string,
  menuKey?: ResourceNodeType,
  pkg?: Partial<IPackage>,
  index?: number,
): TreeDataNode {
  const funcKey = `${dbSession?.database?.databaseId}-${
    packageName ? '' : dbSession?.database?.functionVersion
  }-${packageName}-${dbName}-function-${func.funName}-index:${index}`;
  let paramRoot: TreeDataNode;
  let returnroot: TreeDataNode;
  let variableRoot: TreeDataNode;

  if (func.params?.length) {
    paramRoot = {
      title: formatMessage({ id: 'odc.ResourceTree.Nodes.function.Parameter' }), //参数
      key: `${funcKey}-param`,
      type: ResourceNodeType.FunctionParamRoot,
      icon: (
        <Icon
          component={ParameterSvg}
          style={{
            color: THEME,
          }}
        />
      ),

      children: func.params.map((p) => {
        return {
          title: p.paramName,
          key: `${funcKey}-param-${p.paramName}${p.seqNum}`,
          type: ResourceNodeType.FunctionParam,
          isLeaf: true,
        };
      }),
    };
  }

  if (func.returnType) {
    returnroot = {
      title: formatMessage({ id: 'odc.ResourceTree.Nodes.function.ReturnType' }), //返回类型
      key: `${funcKey}-returnType`,
      type: ResourceNodeType.FunctionReturnTypeRoot,
      icon: (
        <NumberOutlined
          style={{
            color: THEME,
          }}
        />
      ),

      children: [
        {
          title: func.returnType,
          key: `${funcKey}-returnType-${func.returnType}`,
          type: ResourceNodeType.FunctionReturnType,
          isLeaf: true,
        },
      ],
    };
  }

  if (func.variables?.length) {
    variableRoot = {
      title: formatMessage({ id: 'odc.ResourceTree.Nodes.function.Variable' }), //变量
      key: `${funcKey}-variable`,
      icon: (
        <InfoOutlined
          style={{
            color: THEME,
          }}
        />
      ),

      type: ResourceNodeType.FunctionVariableRoot,
      children: func.variables.map((p) => {
        return {
          title: p.varName,
          key: `${funcKey}-variable-${p.varName}${p.varType}`,
          type: ResourceNodeType.FunctionVariable,
          isLeaf: true,
        };
      }),
    };
  }

  return {
    title: func.funName,
    key: funcKey,
    type: ResourceNodeType.Function,
    menuKey,
    pkg,
    dbObjectType: DbObjectType.function,
    warning: func.status === 'INVALID' ? func.errorMessage : null,
    icon: (
      <Icon
        component={FunctionSvg}
        style={{
          color: THEME,
        }}
      />
    ),
    doubleClick(session, node, databaseFrom) {
      pkg
        ? openPackageViewPage(pkg?.packageName, null, false, session?.database?.databaseId)
        : openFunctionViewPage(
            func.funName,
            undefined,
            undefined,
            session?.database?.databaseId,
            null,
          );
    },
    sessionId: dbSession?.sessionId,
    packageName: packageName,
    data: func,
    isLeaf: false,
    children: [paramRoot, returnroot, variableRoot].filter(Boolean),
  };
}

export function FunctionTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  packageName: string = '',
): TreeDataNode {
  const dbName = database.name;
  const functions = dbSession?.database?.functions;
  const treeData: TreeDataNode = {
    title: formatMessage({ id: 'odc.ResourceTree.Nodes.function.Function' }), //函数
    key: `${database.id}-${packageName}-pkg-${dbName}-function`,
    type: ResourceNodeType.FunctionRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };

  if (functions?.length) {
    treeData.children = functions.map((func, i) => {
      return FunctionTreeNodeData(func, dbSession, dbName, packageName, null, null, i);
    });
  }
  return treeData;
}
