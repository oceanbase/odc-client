import { DbObjectType, IFunction, IPackage } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';

import Icon, { FolderOpenFilled, InfoOutlined, NumberOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

import ParameterSvg from '@/svgr/Parameter.svg';

import { IDatabase } from '@/d.ts/database';
import FunctionSvg from '@/svgr/menuFunc.svg';

const THEME = 'var(--icon-color-2)';

export function FunctionTreeNodeData(
  func: Partial<IFunction>,
  dbSession: SessionStore,
  dbName: string,
  packageName?: string,
  menuKey?: ResourceNodeType,
  pkg?: Partial<IPackage>,
): TreeDataNode {
  const funcKey = `${packageName}-${dbName}-function-${func.funName}`;
  let paramRoot: TreeDataNode;
  let returnroot: TreeDataNode;
  let variableRoot: TreeDataNode;

  if (func.params?.length) {
    paramRoot = {
      title: '参数',
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
      title: '返回值',
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
      title: '变量',
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
    title: '函数',
    key: `${packageName}-pkg-${dbName}-function`,
    type: ResourceNodeType.FunctionRoot,
    data: database,
    icon: (
      <FolderOpenFilled
        style={{
          color: '#3FA3FF',
        }}
      />
    ),
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };

  if (functions?.length) {
    treeData.children = functions.map((func) => {
      return FunctionTreeNodeData(func, dbSession, dbName, packageName);
    });
  }
  return treeData;
}
