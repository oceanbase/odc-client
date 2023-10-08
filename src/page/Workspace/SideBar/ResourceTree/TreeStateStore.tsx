import React from 'react';

export type ITreeStateCache = Record<
  string,
  {
    sessionIds: Record<number, string>;
    expandedKeys: (string | number)[];
    loadedKeys: (string | number)[];
  }
>;

const TreeStateStore = React.createContext<{
  cache: ITreeStateCache;
}>({
  cache: {},
});

export default TreeStateStore;
