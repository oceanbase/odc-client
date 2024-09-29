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
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { EnvColorMap } from '@/constant';
import { DBType } from '@/d.ts/database';
import datasourceStatus from '@/store/datasourceStatus';
import { DeleteOutlined } from '@ant-design/icons';
import { Badge, Checkbox, Empty, Popconfirm, Space, Spin, Tooltip, Tree, Typography } from 'antd';
import { DataNode, TreeProps } from 'antd/lib/tree';
import classnames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const { Text } = Typography;

interface IProps {
  projectId: number;
  value?: any[];
  // 最多可以选中的数据的数量
  maxCount?: number;
  onChange?: (newValue: any[]) => void;
  databaseFilter?: any;
  baseDatabase?: number;
  showEnv?: boolean;
  // 选择说明
  infoText?: string;
  setShowSelectLogicDBTip?: (v: boolean) => void;
}

const DatabaseSelecter: React.FC<IProps> = function ({
  projectId,
  value: checkedKeys = [],
  maxCount,
  onChange,
  databaseFilter,
  baseDatabase,
  showEnv,
  infoText,
  setShowSelectLogicDBTip,
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
        setDatabaseList(databaseFilter ? databaseFilter(res?.contents) : res?.contents);
        datasourceStatus.asyncUpdateStatus([
          ...new Set(
            res?.contents
              ?.filter((item) => item.type !== 'LOGICAL')
              ?.map((item) => item?.dataSource?.id),
          ),
        ]);
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
  }, [projectId, baseDatabase]);

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

  const handleCheck = (key: string) => {
    const checked = checkedKeys?.includes(key);
    if (checked) {
      onChange(checkedKeys?.filter((item) => item !== key));
    } else {
      onChange([...checkedKeys, key]);
    }
  };

  function envRender(environment) {
    if (!environment) {
      return null;
    }
    return (
      <Badge
        className={styles.env}
        color={EnvColorMap[environment?.style?.toUpperCase()]?.tipColor}
      />
    );
  }

  function getTreeData(validDatabaseList: any[]) {
    const allTreeData = validDatabaseList?.map((item) => {
      const disabledByCount = maxCount
        ? !(checkedKeys.length < maxCount || checkedKeys.includes(item.id))
        : false;
      const isBaseDb = item?.id === baseDatabase;
      return {
        title: (
          <Tooltip
            placement="topLeft"
            title={
              disabledByCount
                ? formatMessage(
                    {
                      id: 'src.component.Task.component.DatabaseSelecter.EC5561FD',
                      defaultMessage: '最多支持选择 {maxCount} 个数据库',
                    },
                    { maxCount },
                  )
                : isBaseDb
                ? formatMessage({
                    id: 'src.component.Task.component.DatabaseSelecter.36C7926E',
                    defaultMessage: '默认选中基准库',
                  })
                : ''
            }
          >
            <div
              style={{ display: 'flex', width: 260, justifyContent: 'space-between' }}
              onClick={() => {
                !isBaseDb && handleCheck(item?.id);
              }}
            >
              <div>
                <Text style={{ wordBreak: 'keep-all', paddingRight: 4 }}>{item?.name}</Text>
                <Text type="secondary" ellipsis>
                  {item?.dataSource?.name}
                </Text>
              </div>
              {showEnv && !isBaseDb && envRender(item?.environment)}
            </div>
          </Tooltip>
        ),

        disabled: disabledByCount || isBaseDb,
        key: item?.id,
        icon: <DataBaseStatusIcon item={item} showStatusTooltip={false} />,
      };
    });
    return allTreeData;
  }

  function getAllTreeDataKeys(max?: number) {
    const keys = [];
    const allTreeData = getAllTreeData() ?? [];
    const getKeys = (nodes: DataNode[]) => {
      nodes?.forEach((node, index) => {
        if (max && index > max - 1) return;
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
    onChange(checkAll ? [baseDatabase || null] : maxTreeDataKeys);
  };

  const handleSearch = (value) => {
    setSourceSearchValue(value);
  };
  /**
   * 选中一个库后
   */
  const handleChosenDataBase: TreeProps['onCheck'] = useCallback(
    (_checkedKeys, { checked, node: { key: curNodeKey } }) => {
      let list;
      if (checked) {
        list = [...(checkedKeys || []), curNodeKey];
      } else {
        list = checkedKeys?.filter((key) => key !== curNodeKey);
      }
      setShowSelectLogicDBTip?.(
        databaseList?.find((i) => list?.includes(i?.id) && i?.type === DBType.LOGICAL),
      );
      onChange(list || []);
    },
    [checkedKeys, onChange, databaseList],
  );

  const allTreeDataKeys = getAllTreeDataKeys();
  const maxTreeDataKeys = getAllTreeDataKeys(maxCount);
  const checkAll = allTreeDataKeys?.length && maxTreeDataKeys.length === checkedKeys.length;
  const allTreeData = getAllTreeData();
  const selectedTreeData = getCheckedTreeData();
  const allTreeDataCount = allTreeDataKeys?.length;
  const selectedTreeDataCount = checkedKeys?.length;
  const indeterminate = selectedTreeDataCount && selectedTreeDataCount < allTreeDataCount;

  return (
    <>
      {infoText && (
        <div style={{ color: 'var(--text-color-hint)', paddingBottom: 4 }}>
          {formatMessage({
            id: 'src.component.Task.component.DatabaseSelecter.1AD108EB',
            defaultMessage: '仅支持选择与基准库相同数据源类型和环境的数据库',
          })}
        </div>
      )}

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
                        id: 'src.component.Task.component.DatabaseSelecter.D17AE43F' /*选择数据库*/,
                        defaultMessage: '选择数据库',
                      }) /* 选择数据库 */
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
                onCheck={handleChosenDataBase}
              />
            </ExportCard>
          </Spin>
        </div>
        <div className={classnames(styles.content, styles.hasIconTree)}>
          <ExportCard
            title={
              formatMessage(
                {
                  id: 'src.component.Task.component.DatabaseSelecter.D06DB16B',
                  defaultMessage: '已选 {selectedTreeDataCount} 项',
                },
                { selectedTreeDataCount },
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
                    defaultMessage: '确定要清空已选对象吗？',
                  }) /*"确定要清空已选对象吗？"*/
                }
              >
                <a>
                  {
                    formatMessage({
                      id: 'src.component.Task.component.DatabaseSelecter.302B4FB5' /*清空*/,
                      defaultMessage: '清空',
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
                  const disabledByBaseDb = node?.key === baseDatabase;

                  return (
                    <div className={styles.node}>
                      <div className={styles.nodeName}>{node.title}</div>
                      {!disabledByBaseDb && (
                        <a
                          className={styles.delete}
                          onClick={() => {
                            handleDelete(node);
                          }}
                        >
                          <DeleteOutlined />
                        </a>
                      )}
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
    </>
  );
};

export default DatabaseSelecter;
