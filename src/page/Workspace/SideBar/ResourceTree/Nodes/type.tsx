import { DbObjectType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import Icon, { InfoOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { FunctionTreeNodeData } from './function';

import TypeSvg from '@/svgr/menuType.svg';

import { IDatabase } from '@/d.ts/database';
import ParameterSvg from '@/svgr/Parameter.svg';

const THEME = 'var(--icon-color-4)';

export function TypeTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const types = dbSession?.database?.types;
  const treeData: TreeDataNode = {
    title: '类型',
    key: `${dbName}-type`,
    type: ResourceNodeType.TypeRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (types) {
    treeData.children = types.map((type) => {
      const pkgKey = `${dbName}-type-${type.typeName}`;

      const { typeDetail } = type;
      const functions = typeDetail?.functions;
      const variables = typeDetail?.variables;

      let variablesRoot: TreeDataNode, programRoot: TreeDataNode;

      if (variables?.length) {
        variablesRoot = {
          title: '变量',
          key: `${pkgKey}-variable`,
          type: ResourceNodeType.TypeVariableRoot,
          icon: (
            <InfoOutlined
              style={{
                color: THEME,
              }}
            />
          ),
          children: variables?.map((v, i) => {
            return {
              title: `${v.varName}:${v.varType}`,
              key: `${pkgKey}-variable-${v.varName}-${v.varType}-${i}`,
              type: ResourceNodeType.TypeVariable,
              isLeaf: true,
            };
          }),
        };
      }
      if (functions?.length) {
        programRoot = {
          title: '子程序',
          key: `${pkgKey}-program`,
          type: ResourceNodeType.TypeProgramRoot,
          icon: (
            <Icon
              component={ParameterSvg}
              style={{
                color: THEME,
              }}
            />
          ),
          children: functions.map((func, i) => {
            return FunctionTreeNodeData(
              func,
              dbSession,
              dbName,
              `${pkgKey}-${i}`,
              ResourceNodeType.TypeFunction,
            );
          }),
        };
      }

      return {
        title: type.typeName,
        key: pkgKey,
        type: ResourceNodeType.Type,
        data: type,
        dbObjectType: DbObjectType.type,
        icon: (
          <Icon
            component={TypeSvg}
            style={{
              color: THEME,
            }}
          />
        ),
        sessionId: dbSession?.sessionId,
        isLeaf: false,
        children: [variablesRoot, programRoot].filter(Boolean),
      };
    });
  }

  return treeData;
}
