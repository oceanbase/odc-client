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

import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Empty, Input, Spin, Tree, TreeDataNode } from 'antd';
import ResourceLayout from '../../Layout';

import { forwardRef, useContext, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';

import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import ProjectSvg from '@/svgr/project_space.svg';

export default forwardRef(function ProjectTree(props, ref) {
  const [searchKey, setSearchKey] = useState('');
  const context = useContext(ResourceTreeContext);
  const { projectList } = context;
  const selectKeys = [context.selectProjectId].filter(Boolean);
  function setSelectKeys(keys) {
    return context.setSelectProjectId(keys?.[0]);
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        reload() {
          return context.reloadProjectList();
        },
      };
    },
    [],
  );

  const projects: TreeDataNode[] = useMemo(() => {
    return projectList
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
  }, [projectList, searchKey]);

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
                id: 'odc.ResourceTree.Project.SearchForProjectName',
              })} /*搜索项目名称*/
              style={{ width: '100%' }}
              size="small"
            />
          </div>
          <div className={styles.list}>
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
          </div>
        </div>
      }
      bottomLoading={false}
      bottom={null}
    />
  );
});
