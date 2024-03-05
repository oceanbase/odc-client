import { formatMessage } from '@/util/intl';
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

import { listDatabases } from '@/common/network/database';
import ExportCard from '@/component/ExportCard';
import { ReactComponent as DatabaseSvg } from '@/svgr/database.svg';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Empty, Popconfirm, Space, Spin, Tree, Typography, Checkbox } from 'antd';
import React, { useEffect, useState } from 'react';
import { DataNode } from 'antd/lib/tree';
import classnames from 'classnames';
import styles from './index.less';

const { Text } = Typography;

interface IProps {
  projectId: number;
  value?: any[];
  onChange?: (newValue: any[]) => void;
}

const DatabaseSelecter: React.FC<IProps> = function ({
  projectId,
  value: checkedKeys = [],
  onChange,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceSearchValue, setSourceSearchValue] = useState(null);
  const [targetSearchValue, setTargetSearchValue] = useState(null);
  const [databaseList, setDatabaseList] = useState<any[]>([]);

  const loadExportObjects = async () => {
    setIsLoading(true);
    try {
      const res = await listDatabases(projectId, null, null, null, null, null, null, true, null);
      if (res?.contents) {
        setDatabaseList(res?.contents);
      }
    } catch (e) {
      console.trace(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSourceSearchValue(null);
    setTargetSearchValue(null);
  };

  useEffect(() => {
    if (projectId) {
      handleReset();
      loadExportObjects();
    }
  }, [projectId]);

  const getCheckedTreeData = () => {
    const validDatabaseList =
      databaseList
        ?.filter((item) => checkedKeys?.includes(item.id))
        ?.filter((item) => {
          return !targetSearchValue?.length
            ? true
            : item?.name?.toLowerCase().indexOf(targetSearchValue?.toLowerCase()) !== -1;
        }) ?? [];
    return getTreeData(validDatabaseList);
  };

  const getAllTreeData = () => {
    const validDatabaseList = databaseList?.filter((item) => {
      return !sourceSearchValue?.length
        ? true
        : item?.name?.toLowerCase().indexOf(sourceSearchValue?.toLowerCase()) !== -1;
    });
    return getTreeData(validDatabaseList);
  };

  const handleDelete = ({ key }: DataNode) => {
    const nodeKey = key as string;
    onChange(checkedKeys.filter((key) => key !== nodeKey));
  };

  function getTreeData(validDatabaseList: any[]) {
    const allTreeData = validDatabaseList?.map((item) => {
      return {
        title: (
          <Space>
            <Text>{item?.name}</Text>
            <Text type="secondary" ellipsis>
              {item?.dataSource?.name}
            </Text>
          </Space>
        ),

        key: item?.id,
        icon: <Icon component={DatabaseSvg} />,
      };
    });
    return allTreeData;
  }

  function getAllTreeDataKeys() {
    const keys = [];
    const allTreeData = getAllTreeData() ?? [];
    const getKeys = (nodes: DataNode[]) => {
      nodes?.forEach((node) => {
        keys?.push(node.key);
        if (node.children) {
          getKeys(node.children);
        }
      });
      return keys;
    };
    getKeys(allTreeData);
    return keys;
  }

  const handleSwitchSelectAll = () => {
    onChange(checkAll ? [] : allTreeDataKeys);
  };

  const handleSearch = (value) => {
    setSourceSearchValue(value);
  };

  const allTreeDataKeys = getAllTreeDataKeys();
  const checkAll = allTreeDataKeys?.length && allTreeDataKeys.length === checkedKeys.length;
  const allTreeData = getAllTreeData();
  const selectedTreeData = getCheckedTreeData();
  const allTreeDataCount = allTreeDataKeys?.length;
  const selectedTreeDataCount = checkedKeys?.length;
  const indeterminate = selectedTreeDataCount && selectedTreeDataCount < allTreeDataCount;

  return (
    <div className={styles.selecter}>
      <div className={styles.content}>
        <Spin spinning={isLoading}>
          <ExportCard
            title={
              <Space size={4}>
                <Checkbox
                  indeterminate={indeterminate}
                  checked={checkAll}
                  onChange={handleSwitchSelectAll}
                  style={{ marginRight: '8px' }}
                />

                <span>
                  {
                    formatMessage({
                      id: 'src.component.Task.component.DatabaseSelecter.99F8392B' /*全部*/,
                    }) /* 全部 */
                  }
                </span>
                <Text type="secondary">({allTreeDataCount})</Text>
              </Space>
            }
            onSearch={handleSearch}
          >
            <Tree
              showIcon
              checkable
              height={300}
              className={styles.allTree}
              treeData={allTreeData}
              checkedKeys={checkedKeys}
              onCheck={(_checkedKeys) => {
                onChange(_checkedKeys as string[]);
              }}
            />
          </ExportCard>
        </Spin>
      </div>
      <div className={classnames(styles.content, styles.hasIconTree)}>
        <ExportCard
          title={
            formatMessage(
              { id: 'src.component.Task.component.DatabaseSelecter.D06DB16B' },
              { selectedTreeDataCount: selectedTreeDataCount },
            ) /*`已选 ${selectedTreeDataCount} 项`*/
          }
          onSearch={(v) => setTargetSearchValue(v)}
          extra={
            <Popconfirm
              onConfirm={() => {
                onChange([]);
              }}
              placement="left"
              title={
                formatMessage({
                  id: 'src.component.Task.component.DatabaseSelecter.2FB288CA',
                }) /*"确定要清空已选对象吗？"*/
              }
            >
              <a>
                {
                  formatMessage({
                    id: 'src.component.Task.component.DatabaseSelecter.302B4FB5' /*清空*/,
                  }) /* 清空 */
                }
              </a>
            </Popconfirm>
          }
          disabled
        >
          {selectedTreeData?.length ? (
            <Tree
              showIcon
              defaultExpandAll
              autoExpandParent
              checkable={false}
              selectable={false}
              height={300}
              className={styles.selectedTree}
              treeData={selectedTreeData}
              titleRender={(node) => {
                return (
                  <div className={styles.node}>
                    <div className={styles.nodeName}>{node.title}</div>
                    <a
                      className={styles.delete}
                      onClick={() => {
                        handleDelete(node);
                      }}
                    >
                      <DeleteOutlined />
                    </a>
                  </div>
                );
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </ExportCard>
      </div>
    </div>
  );
};

export default DatabaseSelecter;
