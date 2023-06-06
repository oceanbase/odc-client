import Icon from '@ant-design/icons';
import { Empty, Input, Spin, Tree, TreeDataNode } from 'antd';
import ResourceTree from '..';
import ResourceLayout from '../Layout';

import { listProjects } from '@/common/network/project';
import { useRequest } from 'ahooks';
import { useMemo, useState } from 'react';
import styles from './index.less';

import ProjectSvg from '@/svgr/project_space.svg';

export default function ProjectTree() {
  const { data, loading, run } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999, null],
  });

  const [selectKeys, setSelectKeys] = useState<any[]>([]);

  const projects: TreeDataNode[] = useMemo(() => {
    return data?.contents?.map((item) => {
      return {
        title: item.name,
        key: item.id,
        icon: <Icon component={ProjectSvg} />,
      };
    });
  }, [data]);

  return (
    <ResourceLayout
      top={
        <div className={styles.container}>
          <div className={styles.search}>
            <Input.Search style={{ width: '100%' }} size="small" />
          </div>
          <div className={styles.list}>
            <Spin spinning={loading}>
              {projects?.length ? (
                <Tree
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
      bottom={selectKeys?.length ? <ResourceTree databases={[]} /> : null}
    />
  );
}
