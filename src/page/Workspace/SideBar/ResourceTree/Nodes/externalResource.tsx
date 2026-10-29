import { formatMessage } from '@/util/intl';
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

import { FileFilled } from '@ant-design/icons';
import { IDatabase } from '@/d.ts/database';
import SessionStore from '@/store/sessionManager/session';
import { ResourceNodeType, TreeDataNode } from '../type';
import { IExternalResource } from '@/d.ts/externalResoruce';
import { openExternalResourceViewPage } from '@/store/helper/page';
import { message } from 'antd';

export function ExternalResourceTreeData(
  dbSession: SessionStore,
  database: IDatabase,
): TreeDataNode {
  const dbName = database.name;
  const supportExternalResource = dbSession?.supports.find(
    (item) => item.supportType === 'support_external_resource',
  )?.support;
  if (!supportExternalResource) {
    return null;
  }
  const externalResources = dbSession?.database?.externalResources || [];
  const treeData: TreeDataNode = {
    title: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.Nodes.00A9EAFC',
      defaultMessage: '外部资源',
    }),
    key: `${database.id}-${dbName}-externalResource`,
    type: ResourceNodeType.ExternalResourceRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
    icon: null,
  };

  if (externalResources && externalResources.length > 0) {
    treeData.children = externalResources.map((resource: IExternalResource) => {
      return ExternalResourceTreeNodeData(resource, dbSession, database);
    });
  }

  return treeData;
}

export function ExternalResourceTreeNodeData(
  resource: IExternalResource,
  dbSession: SessionStore,
  database: IDatabase,
): TreeDataNode {
  const dbName = database.name;
  const resourceKey = `${database.id}-${dbName}-externalResource-${resource.id}`;

  return {
    title: resource.name,
    key: resourceKey,
    type: ResourceNodeType.ExternalResource,
    data: resource,
    sessionId: dbSession?.sessionId,
    isLeaf: true,
    icon: (
      <FileFilled
        style={{
          color: 'var(--text-color-hint)',
          fontSize: 14,
        }}
      />
    ),

    tip: `${resource.type} - ${resource.url}`,
    doubleClick(session, node) {
      const externalResource: IExternalResource = node.data;
      if (session?.odcDatabase?.id) {
        openExternalResourceViewPage(
          externalResource.name,
          'INFO',
          session.odcDatabase.id,
          session.database?.dbName,
        );
      } else {
        message.error(
          formatMessage({
            id: 'src.page.Workspace.SideBar.ResourceTree.Nodes.532D19CD',
            defaultMessage: '会话信息不完整，无法查看外部资源',
          }),
        );
      }
    },
  };
}
