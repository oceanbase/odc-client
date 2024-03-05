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

import { TreeProps } from 'antd';
import { useContext, useState } from 'react';
import TreeStateStore from './TreeStateStore';
import { TreeDataNode } from './type';
import { EventDataNode } from 'antd/lib/tree';
import sessionManager from '@/store/sessionManager';
import ResourceTreeContext from '../../context/ResourceTreeContext';

export default function useTreeState(id: string) {
  const { cache } = useContext(TreeStateStore);
  const treeContext = useContext(ResourceTreeContext);
  let state: {
    sessionIds: Record<number, string>;
    expandedKeys: (string | number)[];
    loadedKeys: (string | number)[];
  } = cache[id];
  if (!state) {
    cache[id] = state = {
      expandedKeys: [],
      loadedKeys: [],
      sessionIds: {},
    };
  }
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(state.expandedKeys);
  const [loadedKeys, setLoadedKeys] = useState<(string | number)[]>(state.loadedKeys);
  const onExpand: TreeProps['onExpand'] = function (expandedKeys, { expanded, node }) {
    const { sessionId, cid } = node as TreeDataNode & EventDataNode<any>;
    if (sessionId) {
      const session = sessionManager.sessionMap.get(sessionId);
      if (session) {
        treeContext.setCurrentDatabaseId(session?.odcDatabase?.id);
      }
    } else if (cid) {
      treeContext.setCurrentDatabaseId(cid);
    }
    if (expanded && !loadedKeys?.includes(node.key)) {
      /**
       * 只允许在onload内部修改expandedKeys
       * 触发onload可以保证node是加载成功的，并且在loadedkeys中，避免请求失败无限循环
       */
      return;
    }
    cache[id] = Object.assign({}, cache[id], { expandedKeys: [...expandedKeys] });
    setExpandedKeys(expandedKeys);
  };
  const onLoad: TreeProps['onLoad'] = function (loadedKeys, { event, node }) {
    const newExpandedKeys = [...expandedKeys, node.key];
    cache[id] = Object.assign({}, cache[id], {
      loadedKeys: [...loadedKeys],
      expandedKeys: newExpandedKeys,
    });
    setLoadedKeys(loadedKeys);
    setExpandedKeys(newExpandedKeys);
  };

  return {
    onExpand,
    onLoad,
    expandedKeys: [...expandedKeys],
    loadedKeys,
    sessionIds: cache[id].sessionIds,
    setSessionId: (dbId: number, sessionId: string) => {
      cache[id].sessionIds[dbId] = sessionId;
    },
  };
}
