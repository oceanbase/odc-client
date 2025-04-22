import { TreeProps } from 'antd';
import { useContext, useState, useEffect } from 'react';
import TreeStateStore from '../TreeStateStore';
import { isGroupNode } from '@/page/Workspace/SideBar/ResourceTree/const';
import { isString } from 'lodash';
import DatabaseStore from '@/store/sessionManager/database';

export default function useTreeState(id: string) {
  const { cache } = useContext(TreeStateStore);
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
    // @ts-ignore
    if (isGroupNode(node.type)) {
      setExpandedKeys(expandedKeys);
    }
    if (expanded && !loadedKeys?.includes(node.key) && !node.children?.length) {
      /**
       * 只允许在onload内部修改expandedKeys
       * 触发onload可以保证node是加载成功的，并且在loadedkeys中，避免请求失败无限循环
       * 增加children判断，node.children不为空或者空数组的情况下，antd5 Tree不会再触发onload（antd4会）
       */
      return;
    }
    cache[id] = Object.assign({}, cache[id], { expandedKeys: [...expandedKeys] });
    setExpandedKeys(expandedKeys);
  };
  const onLoad: TreeProps['onLoad'] = function (loadedKeys, { event, node }) {
    const newExpandedKeys = Array.from(new Set([...expandedKeys, node.key]));
    cache[id] = Object.assign({}, cache[id], {
      loadedKeys: [...loadedKeys],
      expandedKeys: newExpandedKeys,
    });
    setLoadedKeys(loadedKeys);
    setExpandedKeys(newExpandedKeys);
  };

  useEffect(() => {
    if (DatabaseStore.refreshKey) {
      setExpandedKeys(
        expandedKeys.filter(
          (item) =>
            !(
              isString(item) &&
              item !== DatabaseStore.refreshKey &&
              item.includes(DatabaseStore.refreshKey)
            ),
        ),
      );
      setLoadedKeys(
        loadedKeys.filter(
          (item) =>
            !(
              isString(item) &&
              item !== DatabaseStore.refreshKey &&
              item.includes(DatabaseStore.refreshKey)
            ),
        ),
      );
    }
  }, [DatabaseStore.refreshKey]);

  return {
    onExpand,
    onLoad,
    expandedKeys: [...expandedKeys],
    loadedKeys,
    sessionIds: cache[id].sessionIds,
    setSessionId: (dbId: number, sessionId: string) => {
      cache[id].sessionIds[dbId] = sessionId;
    },
    setExpandedKeys,
  };
}
