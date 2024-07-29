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

import { DbObjectType, TriggerState } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import SessionStore from '@/store/sessionManager/session';
import { ReactComponent as TriggerSvg } from '@/svgr/menuTrigger.svg';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Tooltip } from 'antd';
import { ResourceNodeType, TreeDataNode } from '../type';
import { openTriggerViewPage } from '@/store/helper/page';

enum THEME {
  TRIGGER_ENABLE = 'var(--icon-color-3)',
  TRIGGER_DISABLE = 'var(--icon-color-disable)',
}

export function TriggerTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const triggers = dbSession?.database?.triggers;
  const treeData: TreeDataNode = {
    title: formatMessage({
      id: 'odc.ResourceTree.Nodes.trigger.Trigger',
      defaultMessage: '触发器',
    }), //触发器
    key: `${database.id}-${dbName}-trigger`,
    type: ResourceNodeType.TriggerRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (triggers) {
    treeData.children = triggers.map((trigger) => {
      const title =
        trigger.enableState === TriggerState.enabled
          ? formatMessage({
              id: 'odc.ResourceTree.config.procedure.Enable',
              defaultMessage: '启用',
            }) // 启用
          : formatMessage({
              id: 'odc.ResourceTree.config.procedure.Disable',
              defaultMessage: '禁用',
            }); // 禁用
      const icon = (
        <Tooltip placement="right" title={title}>
          <Icon
            component={TriggerSvg}
            style={{
              color:
                trigger.enableState === TriggerState.enabled
                  ? THEME.TRIGGER_ENABLE
                  : THEME.TRIGGER_DISABLE,
            }}
          />
        </Tooltip>
      );

      const key = `${database.id}-${dbSession?.database?.triggerVersion}-${dbName}-trigger-${trigger.triggerName}`;
      return {
        title: trigger.triggerName,
        key,
        doubleClick(session, node, databaseFrom) {
          openTriggerViewPage(
            trigger.triggerName,
            undefined,
            trigger.enableState,
            undefined,
            session?.database?.databaseId,
          );
        },
        type: ResourceNodeType.Trigger,
        dbObjectType: DbObjectType.trigger,
        data: trigger,
        icon: icon,
        warning: trigger.status === 'INVALID' ? trigger.errorMessage : null,
        sessionId: dbSession?.sessionId,
        isLeaf: true,
      };
    });
  }

  return treeData;
}
