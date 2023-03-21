import { useUpdate } from 'ahooks';
import { useEffect } from 'react';
import { Debug } from './';

export function useDebugContext(debug: Debug) {
  const forceUpdate = useUpdate();
  useEffect(() => {
    if (debug) {
      function listener() {
        forceUpdate();
      }
      debug.addContextListener(listener);
      return () => {
        debug.removeContextListener(listener);
      };
    }
  }, [debug]);
  return debug?.plInfo;
}
