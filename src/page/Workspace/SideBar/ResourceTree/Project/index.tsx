import Icon from '@ant-design/icons';
import { Empty, Input, Spin, Tree, TreeDataNode } from 'antd';
import ResourceTree from '..';
import ResourceLayout from '../Layout';

import { listProjects } from '@/common/network/project';
import { useRequest } from 'ahooks';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';

import { listDatabases } from '@/common/network/database';
import ProjectSvg from '@/svgr/project_space.svg';

export default forwardRef(function ProjectTree(props, ref) {
  const { data, loading, run } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999, null],
  });

  const [selectKeys, setSelectKeys] = useState<any[]>([]);
  const [searchKey, setSearchKey] = useState('');

  useImperativeHandle(
    ref,
    () => {
      return {
        reload() {
          setSelectKeys([]);
          return run(null, 1, 9999, null);
        },
      };
    },
    [run],
  );

  const selectProject = useMemo(() => {
    const key = selectKeys?.[0];
    if (!key) {
      return null;
    }
    return data?.contents?.find((item) => item.id == key);
  }, [selectKeys, data]);

  const projects: TreeDataNode[] = useMemo(() => {
    return data?.contents
      ?.map((item) => {
        if (searchKey && !item.name?.toLowerCase()?.includes(searchKey?.toLowerCase())) {
          return null;
        }
        return {
          title: item.name,
          key: item.id,
          icon: <Icon component={ProjectSvg} />,
        };
      })
      .filter(Boolean);
  }, [data, searchKey]);

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
      runListDatabases(selectKeys?.[0], null, 1, 9999);
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
              placeholder="搜索项目名称"
              style={{ width: '100%' }}
              size="small"
            />
          </div>
          <div className={styles.list}>
            <Spin spinning={loading || dbLoading}>
              {projects?.length ? (
                <Tree
                  showIcon
                  selectedKeys={selectKeys}
                  onSelect={(keys) => {
                    setSelectKeys(keys);
                  }}
                  selectable
                  multiple={false}
                  treeData={projects}
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
          <ResourceTree
            reloadDatabase={() => runListDatabases(selectKeys?.[0], null, 1, 9999)}
            databaseFrom="project"
            title={selectProject?.name}
            databases={db?.contents}
          />
        ) : null
      }
    />
  );
});
