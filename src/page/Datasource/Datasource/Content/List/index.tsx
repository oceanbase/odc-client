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

import { batchTest, getConnectionList } from '@/common/network/connection';
import { IConnection, IConnectionStatus } from '@/d.ts';
import { Result, Space, Spin, Tag } from 'antd';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AutoSizer, InfiniteLoader, List as TableList } from 'react-virtualized';
import ParamContext, { SearchType } from '../../ParamContext';
import ListItem from '../ListItem';
import LoadingItem from '../ListItem/Loading';
import ConnectionName from './ConnectionNameItem';
import MoreBtn from './MoreBtn';

import { IPageType } from '@/d.ts/_index';
import { ClusterStore } from '@/store/cluster';
import { CommonStore } from '@/store/common';
import { PageStore } from '@/store/page';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { clone } from 'lodash';
import { inject, observer } from 'mobx-react';
import { history } from '@umijs/max';
import TitleButton from '../TitleButton';
import RiskLevelLabel from '@/component/RiskLevelLabel';

interface IProps {
  width: number;
  height: number;
  commonStore?: CommonStore;
  pageStore?: PageStore;
  clusterStore?: ClusterStore;
}

const List: React.FC<IProps> = forwardRef(function (
  { width, height, commonStore, pageStore, clusterStore },
  ref,
) {
  const [_connectionList, setConnectionList] = useState<IConnection[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Map<number, IConnection['status']>>(
    new Map(),
  );

  /**
   * 用来控制列表的刷新，不通过依赖筛选项来控制，因为筛选项之间也有依赖关系，会导致同一个改动导致列表请求两次。
   */
  const [version, setVersion] = useState(0);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(null);
  /**
   * 代表当前列表的筛选版本，不同的筛选版本下，请求不能复用，需要丢弃。
   */
  const versionRef = useRef<number>(0);
  const context = useContext(ParamContext);
  const { searchValue, connectType, sortType } = context;

  const connectionList = useMemo(() => {
    return _connectionList.map((c) => {
      return {
        ...c,
        status: connectionStatus[c.id] || c.status,
      };
    });
  }, [_connectionList, connectionStatus]);

  useEffect(() => {
    clusterStore.loadClusterList();
  }, []);

  async function openNewConnection(connection: IConnection) {
    history.push(`/datasource/${connection.id}/${IPageType.Datasource_info}`);
  }

  function fetchNextConnectList() {
    setVersion(version + 1);
  }

  async function refreshConnectionStatus(connectionList: IConnection[]) {
    const ids = connectionList
      ?.filter((a) => a.status?.status === IConnectionStatus.TESTING)
      ?.map((a) => a.id);
    if (ids?.length) {
      const result = await batchTest(ids);
      if (result) {
        let newStatus = clone(connectionStatus);
        ids?.forEach((id) => {
          const status = result[id];
          if (status) {
            newStatus[id] = status;
          }
        });
        setConnectionStatus(newStatus);
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      refreshConnectionStatus(connectionList);
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [connectionList, connectionStatus]);

  async function _fetchNextConnectList(isRefresh?: boolean) {
    const currentVersion = versionRef.current;
    if (height <= 0) {
      return;
    }
    if (isLoading && connectionList?.length > 0) {
      return;
    }
    setIsLoading(true);
    try {
      /**
       * ............|........|
       *    offset    pagesize
       *        targetsize
       */
      const pageSize = Math.ceil((height * 1.5) / 40) || 20;
      /**
       * 需要请求到的数据量
       */
      const targetSize = pageSize + offset;
      let fetchSize: number = pageSize;
      if (isRefresh) {
        fetchSize = offset + 1;
      } else if (offset < pageSize) {
        fetchSize = targetSize;
      } else {
        /**
         * 这里需要寻找offset从 pageSize 开始的最小因数，以此来保证请求量最小。
         */
        for (let i = pageSize; i <= offset; i++) {
          if (targetSize % i === 0) {
            fetchSize = i;
            break;
          }
        }
      }
      const currentPage = Math.floor(offset / fetchSize) + 1;
      const result = await getConnectionList({
        clusterName: [searchValue.type == SearchType.CLUSTER ? searchValue.value : null],
        tenantName: [searchValue.type == SearchType.TENANT ? searchValue.value : null],
        name: searchValue.type == SearchType.NAME ? searchValue.value : null,
        hostPort: searchValue.type == SearchType.HOST ? searchValue.value : null,
        type: connectType,
        fuzzySearchKeyword: searchValue.type == SearchType.ALL ? searchValue.value : null,
        sort: sortType,
        page: currentPage,
        size: fetchSize,
      });

      if (currentVersion !== versionRef.current) {
        return;
      }
      if (result) {
        setTotal(result.page?.totalElements);
        if (!isRefresh) {
          let newConnections = [...connectionList];
          let existMap = {};
          newConnections.forEach((c, index) => {
            existMap[c.id] = index;
          });
          result?.contents?.forEach((c) => {
            const id = c.id;
            if (typeof existMap[id] === 'number') {
              newConnections[existMap[id]] = c;
            } else {
              newConnections.push(c);
            }
          });
          setOffset(newConnections?.length);
          setConnectionList(newConnections);
          refreshConnectionStatus(newConnections);
        } else {
          setConnectionList(result?.contents);
          setOffset(result?.contents?.length);
          refreshConnectionStatus(result?.contents);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        reload() {
          _fetchNextConnectList(true);
        },
      };
    },
    [_fetchNextConnectList],
  );

  useEffect(() => {
    setConnectionList([]);
    setTotal(0);
    setOffset(0);
    versionRef.current = versionRef.current + 1;
    fetchNextConnectList();
  }, [searchValue, connectType, sortType]);

  useLayoutEffect(() => {
    if (version === 0) {
      return;
    }
    _fetchNextConnectList();
  }, [version]);

  function getClusterName(cluster) {
    if (haveOCP()) {
      return clusterStore.clusterList.find((c) => c.instanceId === cluster)?.instanceName || '-';
    }
    return cluster || '-';
  }

  function getTenantName(clusterName, tenantName) {
    if (haveOCP()) {
      const tenantInstance = clusterStore.tenantListMap?.[tenantName];
      if (tenantInstance) {
        return tenantInstance?.find((tenant) => tenant.tenantId === tenantName)?.tenantName || '-';
      }
      const tenantList = clusterStore.tenantListMap[clusterName];
      return tenantList?.find((t) => t.tenantId === tenantName)?.tenantName || '-';
    }
    return tenantName || '-';
  }

  const rowRenderer = function ({ index, key, style }) {
    let content;
    const connection = connectionList[index];

    if (index >= connectionList?.length) {
      content = <LoadingItem />;
    } else {
      if (!connection) {
        return 'Error';
      }
      content = (
        <ListItem
          key={connection.id}
          isConnecting={isConnecting === connection.id}
          connectionName={
            <ConnectionName openNewConnection={openNewConnection} connection={connection} />
          }
          cluster={<div>{getClusterName(connection.clusterName)}</div>}
          tenant={<div>{getTenantName(connection.clusterName, connection.tenantName)}</div>}
          host={<div>{[connection.host, connection.port].filter(Boolean).join(':') || '-'}</div>}
          action={
            <Space size={14}>
              <MoreBtn connection={connection} />
            </Space>
          }
          env={
            <RiskLevelLabel
              color={connection?.environmentStyle}
              content={
                connection?.environmentName ||
                formatMessage({ id: 'odc.Content.List.NoEnvironment' }) //无环境
              }
            />
          }
        />
      );
    }
    return (
      <div style={style} key={key}>
        {content}
      </div>
    );
  };
  if (total === 0) {
    /**
     * 这说明在重刷，展示loading
     */
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <Spin />
        ) : (
          <Result
            status={'success'}
            title={formatMessage({
              id: 'odc.Content.List.NoDatabaseConnection',
            })} /*暂无数据库连接*/
            subTitle={
              <span>
                {
                  formatMessage({
                    id: 'odc.Content.List.YouCanConnectToOceanbase',
                  }) /*支持连接 OceanBase 数据库；*/
                }
              </span>
            }
            icon={<img src={window.publicPath + 'img/graphic_empty.png'} style={{ height: 132 }} />}
            extra={[<TitleButton onReload={() => context.reloadTable()} key="titleButton" />]}
          />
        )}
      </div>
    );
  }
  return (
    <InfiniteLoader
      isRowLoaded={({ index }) => {
        return index < connectionList?.length;
      }}
      rowCount={total}
      loadMoreRows={async ({ startIndex, stopIndex }) => {
        if (startIndex === 0) {
          /**
           * 这里代表初始化，因为上面已经初始化过数据了，所以就不再执行
           */
          return;
        }
        fetchNextConnectList();
      }}
    >
      {({ onRowsRendered, registerChild }) => {
        return (
          <TableList
            ref={registerChild}
            onRowsRendered={onRowsRendered}
            rowRenderer={rowRenderer}
            rowHeight={40}
            height={height}
            width={width}
            rowCount={total}
          />
        );
      }}
    </InfiniteLoader>
  );
});

function AutoSizerWrap(props, ref) {
  return (
    <AutoSizer>
      {({ width, height }) => {
        return <List ref={ref} width={width} height={height} {...props} />;
      }}
    </AutoSizer>
  );
}

export default inject(
  'commonStore',
  'pageStore',
  'clusterStore',
)(observer(forwardRef(AutoSizerWrap)));
