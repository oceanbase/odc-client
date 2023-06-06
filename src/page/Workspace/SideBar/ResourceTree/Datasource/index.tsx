import Icon from '@ant-design/icons';
import { Empty, Input, Spin, Tree, TreeDataNode } from 'antd';
import ResourceTree from '..';
import ResourceLayout from '../Layout';

import { getConnectionList } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import ProjectSvg from '@/svgr/project_space.svg';
import { useRequest } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

export default function DatasourceTree() {
  const { data, loading, run } = useRequest(getConnectionList, {
    defaultParams: [{ size: 9999, page: 1 }],
  });

  const [selectKeys, setSelectKeys] = useState<any[]>([]);

  const selectConnection = useMemo(() => {
    const key = selectKeys?.[0];
    if (!key) {
      return null;
    }
    return data?.contents?.find((item) => item.id == key);
  }, [selectKeys, data]);

  const datasource: TreeDataNode[] = useMemo(() => {
    return data?.contents?.map((item) => {
      return {
        title: item.name,
        key: item.id,
        icon: <Icon component={ProjectSvg} />,
      };
    });
  }, [data]);

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
            <Input.Search placeholder="搜索数据源" style={{ width: '100%' }} size="small" />
          </div>
          <div className={styles.list}>
            <Spin spinning={loading || dbLoading}>
              {datasource?.length ? (
                <Tree
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
      bottom={
        selectKeys?.length ? (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <ResourceTree
              title={selectConnection?.name}
              key={selectKeys?.[0]}
              databases={db?.contents}
            />
          </div>
        ) : null
      }
    />
  );
}
