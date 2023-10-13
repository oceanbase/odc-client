import { TreeProps } from 'antd';
import { useContext, useState } from 'react';
import TreeStateStore from './TreeStateStore';

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
    console.log('expand', node.key);
    if (expanded && !loadedKeys?.includes(node.key)) {
      return;
    }
    cache[id] = Object.assign({}, cache[id], { expandedKeys: [...expandedKeys] });
    setExpandedKeys(expandedKeys);
  };
  const onLoad: TreeProps['onLoad'] = function (loadedKeys, { event, node }) {
    console.log('onload', node.key);
    cache[id] = Object.assign({}, cache[id], { loadedKeys: [...loadedKeys] });
    setLoadedKeys(loadedKeys);
    setExpandedKeys([...expandedKeys, node.key]);
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
