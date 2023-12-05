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

import { DbObjectType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import Icon, { InfoOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { FunctionTreeNodeData } from './function';

import { ReactComponent as TypeSvg  } from '@/svgr/menuType.svg';

import { IDatabase } from '@/d.ts/database';
import { ReactComponent as ParameterSvg  } from '@/svgr/Parameter.svg';
import { ProcedureTreeNodeData } from './procedure';
import { openTypeViewPage } from '@/store/helper/page';

const THEME = 'var(--icon-color-4)';

export function TypeTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const types = dbSession?.database?.types;
  const treeData: TreeDataNode = {
    title: formatMessage({ id: 'odc.ResourceTree.Nodes.type.Type' }), //类型
    key: `${database.id}-${dbName}-type`,
    type: ResourceNodeType.TypeRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (types) {
    treeData.children = types.map((type) => {
      const pkgKey = `${database.id}-${dbSession?.database?.typeVersion}-${dbName}-type-${type.typeName}`;

      const { typeDetail } = type;
      const functions = typeDetail?.functions;
      const variables = typeDetail?.variables;
      const procedures = typeDetail?.procedures;

      let variablesRoot: TreeDataNode, programRoot: TreeDataNode;

      if (variables?.length) {
        variablesRoot = {
          title: formatMessage({ id: 'odc.ResourceTree.Nodes.type.Variable' }), //变量
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
      if (functions?.length || procedures?.length) {
        programRoot = {
          title: formatMessage({ id: 'odc.ResourceTree.Nodes.type.Subprogram' }), //子程序
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

          children: (functions || [])
            .map((func, i) => {
              return FunctionTreeNodeData(
                func,
                dbSession,
                dbName,
                `${pkgKey}-${i}`,
                ResourceNodeType.TypeFunction,
                null,
                i,
              );
            })
            .concat(
              (procedures || []).map((func, i) => {
                return ProcedureTreeNodeData(
                  func,
                  dbSession,
                  dbName,
                  `${pkgKey}-${i}`,
                  ResourceNodeType.TypeProcedure,
                  null,
                  i,
                );
              }),
            ),
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
        doubleClick(session, node, databaseFrom) {
          openTypeViewPage(type.typeName, undefined, session?.database?.databaseId);
        },
        sessionId: dbSession?.sessionId,
        isLeaf: false,
        children: [variablesRoot, programRoot].filter(Boolean),
      };
    });
  }

  return treeData;
}
