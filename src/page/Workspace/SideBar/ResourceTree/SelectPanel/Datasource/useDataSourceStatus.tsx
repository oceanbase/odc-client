import { batchTest } from '@/common/network/connection';
import { IConnectionStatus } from '@/d.ts';
import { useUnmountedRef } from 'ahooks';
import { debounce, toInteger } from 'lodash';
import { useEffect, useRef, useState } from 'react';

export function useDataSourceStatus() {
  const [statusMap, setStatusMap] = useState<
    Record<
      number,
      {
        errorCode: string;
        errorMessage: string;
        status: any;
        type: any;
      }
    >
  >({});
  const loadingQueue = useRef<number[]>([]);
  const fetchedQueue = useRef<number[]>([]);
  const isFetching = useRef(false);
  const fetchTimer = useRef<any>(null);
  const unmountRef = useUnmountedRef();
  /**
   * destory fetchTimer before unnmount
   */

  useEffect(() => {
    return () => {
      if (fetchTimer.current) {
        fetchTimer.current = null;
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  function fetchStatus(datasourceId: number) {
    if (
      !datasourceId ||
      loadingQueue.current.includes(datasourceId) ||
      fetchedQueue.current.includes(datasourceId)
    ) {
      return;
    }
    loadingQueue.current.push(datasourceId);
    batchBeginFetch();
  }
  const batchBeginFetch = debounce(beginFetch, 50);
  async function beginFetch() {
    if (isFetching.current || unmountRef.current) {
      return;
    }
    isFetching.current = true;
    const datasourceIds = loadingQueue.current.slice(0, 50);
    if (!datasourceIds.length) {
      isFetching.current = false;
      return;
    }
    const map = await batchTest(datasourceIds);
    if (!map || unmountRef.current) {
      isFetching.current = false;
      return;
    }
    const fetchedIds = Object.entries(map)
      .map(([key, value]) => {
        if (value.status !== IConnectionStatus.TESTING) {
          return toInteger(key);
        }
      })
      .filter(Boolean);
    loadingQueue.current = loadingQueue.current.filter((id) => !fetchedIds.includes(id));
    fetchedQueue.current = fetchedQueue.current.concat(fetchedIds);
    setStatusMap((prev) => {
      return {
        ...prev,
        ...map,
      };
    });
    if (loadingQueue.current.length) {
      fetchTimer.current = setTimeout(() => {
        isFetching.current = false;
        beginFetch();
      }, 1000);
    } else {
      isFetching.current = false;
    }
  }
  function reload() {
    fetchedQueue.current = [];
    setStatusMap({});
  }
  return {
    fetchStatus,
    statusMap,
    reload,
  };
}
