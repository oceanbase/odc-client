import React from 'react';

export const MultipleAsyncContext = React.createContext<{
  projectId: number;
  projectMap: Record<number, string>;
}>({
  projectId: null,
  projectMap: {},
});
