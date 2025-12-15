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
import { TopTab } from '@/page/Workspace/components/PackagePage';
import { ReactComponent as ParameterSvg } from '@/svgr/Parameter.svg';
import { IDatabase } from '@/d.ts/database';
import { openFunctionViewPage, openPackageViewPage } from '@/store/helper/page';
import { ReactComponent as FunctionSvg } from '@/svgr/menuFunc.svg';

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
  const funcKey = `${dbSession?.database?.databaseId}-${packageName}-${dbName}-function-pkg-${func.funName}-index:${index}`;
  let paramRoot: TreeDataNode;
  let returnroot: TreeDataNode;
  let variableRoot: TreeDataNode;

  if (func.params?.length) {
    paramRoot = {
      title: formatMessage({
        id: 'odc.ResourceTree.Nodes.function.Parameter',
        defaultMessage: '参数',
      }), //参数
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
      title: formatMessage({
        id: 'odc.ResourceTree.Nodes.function.ReturnType',
        defaultMessage: '返回类型',
      }), //返回类型
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
      title: formatMessage({
        id: 'odc.ResourceTree.Nodes.function.Variable',
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
    doubleClick(session, node) {
      // 程序包中的子程序 双击直接打开所在的程序包详情
      switch (menuKey) {
        case ResourceNodeType.PackageHeadFunction: {
          openPackageViewPage(pkg.packageName, TopTab.HEAD, false, session?.database?.databaseId);
          break;
        }
        case ResourceNodeType.PackageBodyFunction: {
          openPackageViewPage(pkg.packageName, TopTab.BODY, false, session?.database?.databaseId);
          break;
        }
        default: {
          openFunctionViewPage(
            func.funName,
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
    title: formatMessage({
      id: 'odc.ResourceTree.Nodes.function.Function',
      defaultMessage: '函数',
    }), //函数
    key: `${database.id}-${dbName}-function-pkg`,
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
