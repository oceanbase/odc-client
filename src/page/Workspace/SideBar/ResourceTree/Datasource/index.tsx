import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Empty, Input, Popover, Spin, Tree, TreeDataNode } from 'antd';
import ResourceTree from '..';
import ResourceLayout from '../Layout';

import { getDataSourceGroupByProject } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { useRequest } from 'ahooks';
import { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';

import ConnectionPopover from '@/component/ConnectionPopover';
import { IDatasource } from '@/d.ts/datasource';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import OBSvg from '@/svgr/source_ob.svg';
import { toNumber } from 'lodash';

export default forwardRef(function DatasourceTree(props, ref) {
  const { data, loading, run } = useRequest(getDataSourceGroupByProject);

  const [searchKey, setSearchKey] = useState('');

  const context = useContext(ResourceTreeContext);

  const selectKeys = [context.selectDatasourceId].filter(Boolean);
  function setSelectKeys(keys) {
    return context.setSelectDatasourceId(keys?.[0]);
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        reload() {
          setSelectKeys([]);
          context?.setSelectDatasourceId(null);
          return run();
        },
      };
    },
    [run],
  );

  const selectConnection = useMemo(() => {
    const key = selectKeys?.[0];
    if (!key) {
      return null;
    }
    return data?.contents?.find((item) => item.id == key);
  }, [selectKeys, data]);

  const datasource: TreeDataNode[] = useMemo(() => {
    return data?.contents
      ?.map((item) => {
        if (searchKey && !item.name?.toLowerCase()?.includes(searchKey?.toLowerCase())) {
          return null;
        }
        return {
          title: item.name,
          key: item.id,
          icon: <Icon component={OBSvg} style={{ fontSize: 16 }} />,
        };
      })
      .filter(Boolean);
  }, [data, searchKey]);

  const datasourceMap = useMemo(() => {
    const map = new Map<number, IDatasource>();
    data?.contents?.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [data?.contents]);

  const {
    data: db,
    reset,
    run: runListDatabases,
    loading: dbLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });

  useEffect(() => {
    console.log(selectKeys?.[0]);
    if (selectKeys?.[0]) {
      runListDatabases(null, selectKeys?.[0], 1, 9999);
    } else {
      reset();
    }
  }, [selectKeys?.[0]]);

  return (
    <ResourceLayout
      top={
        <div className={styles.container}>
          <div className={styles.search}>
            <Input.Search
              onSearch={(v) => {
                setSearchKey(v);
              }}
              placeholder={formatMessage({
                id: 'odc.ResourceTree.Datasource.SearchForDataSources',
              })} /*搜索数据源*/
              style={{ width: '100%' }}
              size="small"
            />
          </div>
          <div className={styles.list}>
            <Spin spinning={loading || dbLoading}>
              {datasource?.length ? (
                <Tree
                  titleRender={(node) => {
                    return (
                      <Popover
                        showArrow={false}
                        overlayClassName={styles.connectionPopover}
                        placement="rightBottom"
                        content={
                          <ConnectionPopover connection={datasourceMap.get(toNumber(node.key))} />
                        }
                      >
                        {node.title}
                      </Popover>
                    );
                  }}
                  selectedKeys={selectKeys}
                  onSelect={(keys) => {
                    setSelectKeys(keys);
                  }}
                  showIcon
                  selectable
                  multiple={false}
                  treeData={datasource}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Spin>
          </div>
        </div>
      }
      bottomLoading={dbLoading}
      bottom={
        selectKeys?.length ? (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <ResourceTree
              reloadDatabase={() => runListDatabases(null, selectKeys?.[0], 1, 9999)}
              databaseFrom="datasource"
              title={selectConnection?.name}
              key={selectKeys?.[0]}
              databases={db?.contents}
            />
          </div>
        ) : null
      }
    />
  );
});
