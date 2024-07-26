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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { listDatabases } from '@/common/network/database';
import { getTableListWithoutSession } from '@/common/network/table';
import ExportCard from '@/component/ExportCard';
import { IDatabase } from '@/d.ts/database';
import { TablePermissionType } from '@/d.ts/table';
import { ReactComponent as TableSvg } from '@/svgr/menuTable.svg';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Badge, Empty, Popconfirm, Space, Spin, Tree, Typography } from 'antd';
import { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import classnames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from 'react';
import { isNumber } from 'lodash';
import styles from './index.less';
import { EnvColorMap } from '@/constant';

export type TableItem = { databaseId: number; tableName: string; tableId?: number };

type IProps = {
  projectId: number;
  value?: TableItem[];
  onChange?: (newValue: TableItem[]) => void;
};

export interface TableSelecterRef {
  loadTables: (dbId: number) => Promise<void>;
  expandTable: (dbId: number) => void;
}

export interface TableListItem {
  tableName: string;
  authorizedPermissionTypes: TablePermissionType[];
}

export type TableItemInDB = {
  name: string;
  id: number;
};

/**
 * 库以及它下面的表的信息
 */
interface IDataBaseWithTable extends IDatabase {
  /**
   * 表列表
   */
  tableList: TableItemInDB[];
  hasGetTableList?: boolean;
}

const { Text } = Typography;

const KEY_SPLIT_CHAR = '-';
/**
 *  使用dataBaseId和tableName生成key 用于树节点的Key
 */
const generateKeyByDataBaseIdAndTableName = ({ databaseId, tableName, tableId }: TableItem) => {
  return `${databaseId}${KEY_SPLIT_CHAR}${tableName}${KEY_SPLIT_CHAR}${tableId}`;
};
/**
 * 和generateKeyByDataBaseIdAndTableName配套使用
 * 解析Key中的dataBaseId和tableName
 */
const parseDataBaseIdAndTableNamebByKey = (key: string): TableItem => {
  const [databaseId, tableName, tableId] = key.split(KEY_SPLIT_CHAR);
  return { databaseId: Number(databaseId), tableName, tableId: Number(tableId) };
};

/**
 * 按库将表分组返回：
 * 可用来获取:用户授权的提交参数
 * @param tables
 * @returns
 */
export const groupTableByDataBase = (tables: TableItem[]): { tableId: number }[] => {
  return tables.map((item) => {
    return {
      tableId: item.tableId,
    };
  });
};

/**
 * 按库将表分组返回：
 * 可用来获取:工单授权的提交参数
 * @param tables
 * @returns
 */
export const groupTableIdsByDataBase = (tables: TableItem[]): number[] => {
  return [...new Set(tables?.map((i) => i.tableId))];
};
/**
 * 和groupTableByDataBase配合使用
 * 可将groupTableByDataBase按库分组后的值拍平为TableItem
 * 就可以直接set到TableSeletor上了
 * @param tables
 * @returns
 */
export const flatTableByGroupedParams = (
  tables: { databaseId: number; tableList: TableItemInDB[] }[],
): TableItem[] => {
  if (!tables) {
    return [];
  }
  const result: TableItem[] = [];
  tables.forEach(({ databaseId, tableList }) => {
    tableList?.forEach((item) => {
      item?.name && result.push({ databaseId, tableName: item.name, tableId: item.id });
    });
  });
  return result;
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

/**
 * 将原始的IDataBaseWithTable数据转成TreeData格式
 * @param validTableList
 * @returns
 */
const getTreeData = (validTableList: IDataBaseWithTable[], isSourceTree = false) => {
  const allTreeData = validTableList?.map((database) => {
    const { id, name, tableList, dataSource, hasGetTableList, environment } = database;
    const children = tableList.map((tableItem) => ({
      title: (
        <Space>
          <Text>{tableItem.name}</Text>
        </Space>
      ),

      key: generateKeyByDataBaseIdAndTableName({
        databaseId: id,
        tableName: tableItem.name,
        tableId: tableItem.id,
      }),
      icon: <Icon component={TableSvg} />,
      checkable: true,
      isLeaf: true,
    }));
    return {
      title: (
        <Space>
          <Text>{name}</Text>
          <Text type="secondary" ellipsis>
            {dataSource?.name}
          </Text>
          <Text type="secondary" ellipsis>
            {hasGetTableList && isSourceTree ? `(${tableList.length})` : ''}
          </Text>
          {isSourceTree ? envRender(environment) : null}
        </Space>
      ),

      key: id,
      icon: <Icon component={getDataSourceStyleByConnectType(dataSource.type).dbIcon.component} />,
      checkable: true,
      disabled: hasGetTableList && tableList.length === 0,
      expandable: true,
      children,
      isLeaf: false,
    };
  });
  return allTreeData;
};

const TableSelecter: React.ForwardRefRenderFunction<TableSelecterRef, IProps> = (
  { projectId, value = [], onChange },
  ref,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceSearchValue, setSourceSearchValue] = useState(null);
  const [targetSearchValue, setTargetSearchValue] = useState(null);
  const [databaseWithTableList, setDataBaseWithTableList] = useState<IDataBaseWithTable[]>([]);
  const [sourceTreeExpandKeys, setSourceTreeExpandKeys] = useState<number[]>([]);
  const [selectedExpandKeys, setSelectedExpandKeys] = useState<number[]>([]);
  /**
   * 需要的参数格式转换成树的Key
   */
  const checkedKeys: string[] = useMemo(() => {
    return value.map(generateKeyByDataBaseIdAndTableName);
  }, [value]);
  /**
   * 获取项目下所有的数据库
   */
  const loadDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listDatabases(projectId, null, null, null, null, null, null, true, true);
      if (res?.contents) {
        const list: IDataBaseWithTable[] = res.contents.map((db) => ({
          ...db,
          tableList: [],
        }));
        setDataBaseWithTableList(list || []);
      }
    } catch (e) {
      console.trace(e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  /**
   * 重置搜索条件
   */
  const handleReset = () => {
    setSourceSearchValue(null);
    setTargetSearchValue(null);
  };
  /**
   * 待选择的所有库表（按搜索条件过滤后）
   */
  const allTreeData = useMemo(() => {
    if (!sourceSearchValue?.length) {
      return getTreeData(databaseWithTableList, true);
    }
    const filtedDataSource = [];
    for (const datasource of databaseWithTableList) {
      let { tableList, name } = datasource;
      if (name?.toLowerCase().includes(sourceSearchValue?.toLowerCase())) {
        filtedDataSource.push(datasource);
      } else {
        const targetTableList = tableList.filter((item) => item?.name?.includes(sourceSearchValue));
        if (targetTableList.length > 0) {
          filtedDataSource.push({
            ...datasource,
            tableList: targetTableList,
          });
        }
      }
    }
    return getTreeData(filtedDataSource, true);
  }, [sourceSearchValue, databaseWithTableList]);

  /**
   * 已选择的所有库表(按搜索条件过滤)
   */
  const selectedTreeData = useMemo(() => {
    try {
      const filtedDataSource = [];
      for (const datasource of databaseWithTableList) {
        let { tableList, id: databaseId, name: tableName } = datasource;
        const checkedTableNames = tableList.filter((item) =>
          checkedKeys?.includes(
            generateKeyByDataBaseIdAndTableName({
              databaseId,
              tableName: item.name,
              tableId: item.id,
            }),
          ),
        );
        if (!checkedKeys.includes(String(databaseId)) && checkedTableNames.length < 1) {
          continue;
        }
        if (tableName.includes(targetSearchValue) || !targetSearchValue) {
          filtedDataSource.push({
            ...datasource,
            tableList: checkedTableNames,
          });
        } else {
          const searchedTableList = checkedTableNames.filter((item) =>
            item?.name.includes(targetSearchValue),
          );
          if (searchedTableList.length > 0) {
            filtedDataSource.push({
              ...datasource,
              tableList: searchedTableList,
            });
          }
        }
      }
      return getTreeData(filtedDataSource);
    } catch (err) {}
  }, [databaseWithTableList, checkedKeys, targetSearchValue]);
  /**
   * 点击删除已选中的选项
   */
  const handleDelete = useCallback(
    (node: DataNode) => {
      const { key, children } = node;
      let remainKeys = [];
      if (children?.length > 0) {
        const chidrenKeys = children.map(({ key }) => key);
        remainKeys = checkedKeys.filter((key) => !chidrenKeys.includes(key));
      } else {
        const nodeKey = key as string;
        remainKeys = checkedKeys.filter((key) => key !== nodeKey);
      }
      const newValue = remainKeys.map(parseDataBaseIdAndTableNamebByKey);
      onChange(newValue);
      const willExpandKeys: number[] = newValue.map(({ databaseId }) => databaseId);
      setSelectedExpandKeys(Array.from(new Set(willExpandKeys)));
    },
    [checkedKeys, onChange],
  );
  /**
   * 加载库里包含的表
   */
  const handleLoadTables = useCallback(async (databaseId: number) => {
    const tables = await getTableListWithoutSession(databaseId);
    const tableList = tables.map(({ name, id }) => {
      return { name: name, id: id };
    });
    setDataBaseWithTableList((prevData) => {
      for (const item of prevData) {
        if (item.id === databaseId) {
          item.tableList = tableList;
          item.hasGetTableList = true;
          return [...prevData];
        }
      }
    });
  }, []);
  /**
   * 所有选中的节点的Key
   */
  const allTreeDataKeys = useMemo(() => {
    const keys = [];
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
  }, [allTreeData]);

  const fetchChildKeysForParent = useCallback(async (parentId) => {
    const tables = await getTableListWithoutSession(parentId);
    const tableList = tables.map(({ name, id }) => {
      return { name: name, id: id };
    });
    setDataBaseWithTableList((prevData) => {
      for (const item of prevData) {
        if (item.id === parentId) {
          item.tableList = tableList;
          item.hasGetTableList = true;
          return [...prevData];
        }
      }
    });
    return tables.map((table) => {
      return {
        databaseId: parentId,
        tableName: table.name,
        tableId: table.id,
      };
    });
  }, []);

  /**
   * 选中一张表后
   */
  const handleChosenTable: TreeProps['onCheck'] = useCallback(
    async (_checkedKeys: string[], { checked, node: { key: curNodeKey, children } }) => {
      if (isNumber(curNodeKey)) {
        if (checked) {
          const newList = await fetchChildKeysForParent(curNodeKey);
          const tableList = [...checkedKeys.map(parseDataBaseIdAndTableNamebByKey), ...newList];
          onChange(tableList);
          setSelectedExpandKeys(tableList.map((i) => i.databaseId));
        } else {
          const childrenList = [
            ...children.map((i) => parseDataBaseIdAndTableNamebByKey(i.key as string)),
          ]?.map((i) => i.tableId);
          const tableList = [...checkedKeys.map(parseDataBaseIdAndTableNamebByKey)].filter((i) => {
            return !childrenList.includes(i.tableId);
          });
          onChange(tableList);
          setSelectedExpandKeys(tableList.map((i) => i.databaseId));
        }
      } else {
        const preCheckKeys = checked
          ? checkedKeys
          : checkedKeys.filter((key) => key !== curNodeKey);
        const newValue: TableItem[] = preCheckKeys.map(parseDataBaseIdAndTableNamebByKey);
        const willExpandKeys: number[] = newValue.map(({ databaseId }) => databaseId);
        if (checked) {
          const tableItem = parseDataBaseIdAndTableNamebByKey(curNodeKey as string);
          newValue.push(tableItem);
          willExpandKeys.push(tableItem.databaseId);
        }
        onChange(newValue);
        setSelectedExpandKeys(Array.from(new Set(willExpandKeys)));
      }
    },
    [checkedKeys, onChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      /**
       * 展开一个库下面的表
       * 目前用于SQL窗口中发起表权限申请时默认勾选
       */
      loadTables: handleLoadTables,
      /**
       * 展开一个库节点
       * 目前用于SQL窗口中发起表权限申请时默认展开
       */
      expandTable: (databaseId: number) => {
        setSourceTreeExpandKeys((prevExpandKeys) => {
          return Array.from(new Set([...prevExpandKeys, databaseId]));
        });
        setSelectedExpandKeys((prevExpandKeys) => {
          return Array.from(new Set([...prevExpandKeys, databaseId]));
        });
      },
    }),
    [handleLoadTables],
  );

  useEffect(() => {
    /**
     * 有项目初始值时，默认加载项目下的表列表
     */
    if (projectId) {
      handleReset();
      loadDatabases();
    }
  }, [loadDatabases, projectId]);

  const { checkAll, allTreeDataCount, selectedTreeDataCount, indeterminate } = useMemo(() => {
    const allTreeDataCount = allTreeDataKeys?.length;
    const selectedTreeDataCount = checkedKeys?.length;
    return {
      allTreeDataCount,
      selectedTreeDataCount,
      checkAll: allTreeDataKeys?.length && allTreeDataKeys.length === checkedKeys.length,
      indeterminate: selectedTreeDataCount && selectedTreeDataCount < allTreeDataCount,
    };
  }, [allTreeDataKeys.length, checkedKeys.length]);

  return (
    <div className={styles.selecter}>
      <div className={styles.content}>
        <Spin spinning={isLoading}>
          <ExportCard
            title={
              <Space size={4}>
                <span>
                  {formatMessage({
                    id: 'src.component.Task.component.TableSelecter.E836E630',
                    defaultMessage: '选择表',
                  })}
                </span>
              </Space>
            }
            onSearch={setSourceSearchValue}
          >
            <Tree
              blockNode
              checkable
              showIcon
              height={300}
              className={styles.allTree}
              treeData={allTreeData}
              checkedKeys={checkedKeys}
              onCheck={handleChosenTable}
              expandedKeys={sourceTreeExpandKeys}
              onExpand={(keys) => {
                setSourceTreeExpandKeys(keys as number[]);
              }}
              loadData={({ key }: EventDataNode<DataNode>) => handleLoadTables(key as number)}
            />
          </ExportCard>
        </Spin>
      </div>
      <div className={classnames(styles.content, styles.hasIconTree)}>
        <ExportCard
          title={formatMessage(
            {
              id: 'src.component.Task.component.TableSelecter.9995622C',
              defaultMessage: '已选 ${selectedTreeDataCount} 项',
            },
            { selectedTreeDataCount: selectedTreeDataCount },
          )}
          onSearch={(v) => setTargetSearchValue(v)}
          extra={
            <Popconfirm
              onConfirm={() => {
                onChange([]);
              }}
              placement="left"
              title={formatMessage({
                id: 'src.component.Task.component.TableSelecter.A56A8B2D',
                defaultMessage: '确定要清空已选对象吗？',
              })}
            >
              <a>
                {formatMessage({
                  id: 'src.component.Task.component.TableSelecter.C6AF0504',
                  defaultMessage: '清空',
                })}
              </a>
            </Popconfirm>
          }
          disabled
        >
          {selectedTreeData?.length ? (
            <Tree
              blockNode
              showIcon
              autoExpandParent
              defaultExpandAll
              defaultExpandParent
              checkable={false}
              selectable={false}
              height={300}
              className={styles.selectedTree}
              treeData={selectedTreeData}
              expandedKeys={selectedExpandKeys}
              onExpand={(keys) => {
                setSelectedExpandKeys(keys as number[]);
              }}
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

export default React.forwardRef(TableSelecter);
