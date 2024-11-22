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
import { getTableListWithoutSession } from '@/common/network/table';
import ExportCard from '@/component/ExportCard';
import { EnvColorMap } from '@/constant';
import { ReactComponent as TableSvg } from '@/svgr/menuTable.svg';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Badge, Empty, Popconfirm, Space, Spin, Tree, Typography } from 'antd';
import { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import classnames from 'classnames';
import { isNumber, toNumber } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import datasourceStatus from '@/store/datasourceStatus';
import { isLogicalDatabase } from '@/util/database';
import { logicalDatabaseDetail } from '@/common/network/logicalDatabase';
import { DbObjectType, ITable } from '@/d.ts';

import {
  IDataBaseWithTable,
  TableItem,
  TableItemInDB,
  TableSelecterRef,
  tableTreeEventDataNode,
} from './interface';
import sessionManager from '@/store/sessionManager';

type IProps = {
  projectId: number;
  value?: TableItem[];
  onChange?: (newValue: TableItem[]) => void;
};

const { Text } = Typography;

const KEY_SPLIT_CHAR = '@--@';
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
    const { id, name, tableList, dataSource, externalTablesList, hasGetTableList, environment } =
      database;

    let children = [];

    const childrenForTable = {
      title: '表',
      key: `${id}-table`,
      selectable: false,
      disabled: hasGetTableList && tableList?.length === 0,
      children: tableList?.map((tableItem) => ({
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
      })),
    };
    const childrenForExternalTable = {
      title: '外表',
      key: `${id}-externalTable`,
      disabled: hasGetTableList && externalTablesList?.length === 0,
      children: externalTablesList?.map((tableItem) => ({
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
        selectable: !externalTablesList.length,
      })),
    };

    children = !hasGetTableList
      ? []
      : [childrenForTable, childrenForExternalTable]?.filter(Boolean);

    return {
      title: (
        <Space size={2}>
          <Text ellipsis style={{ wordBreak: 'keep-all', paddingLeft: 4, maxWidth: 160 }} title={name}>{name}</Text>
          <Text type="secondary" ellipsis style={{ maxWidth: 80 }} title={dataSource?.name}>
            {dataSource?.name}
          </Text>
          <Text type="secondary" ellipsis>
            {hasGetTableList && isSourceTree ? `(${tableList?.length})` : ''}
          </Text>
          {isSourceTree ? envRender(environment) : null}
        </Space>
      ),
      key: id,
      icon: <DataBaseStatusIcon item={database} />,
      checkable: true,
      disabled: hasGetTableList && tableList?.length === 0,
      expandable: true,
      children: children,
      isLeaf: false,
      isLogicalDatabase: isLogicalDatabase(database),
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
  const [selectedExpandKeys, setSelectedExpandKeys] = useState<(number | string)[]>([]);
  const [selecting, setSelecting] = useState(false);
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
        datasourceStatus.asyncUpdateStatus(
          res?.contents
            ?.filter((item) => item.type !== 'LOGICAL')
            ?.map((item) => item?.dataSource?.id),
        );
        const list: IDataBaseWithTable[] = res.contents.map((db) => {
          return {
            ...db,
            tableList: [],
            externalTablesList: [],
            isExternalTable: false,
            showTable: true,
          };
        });
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
   * 待选择的所有库表（按搜索条件过滤后） 左侧数据
   */
  const allTreeData = useMemo(() => {
    if (!sourceSearchValue?.length) {
      return getTreeData(databaseWithTableList, true);
    }
    const filtedDataSource = [];
    for (const datasource of databaseWithTableList) {
      let { tableList, name, externalTablesList } = datasource;
      if (name?.toLowerCase().includes(sourceSearchValue?.toLowerCase())) {
        filtedDataSource.push(datasource);
      } else {
        const targetTableList = tableList.filter((item) => item?.name?.includes(sourceSearchValue));
        const targetExternalTableList = externalTablesList?.filter((item) =>
          item?.name?.includes(sourceSearchValue),
        );
        if (targetTableList.length > 0) {
          filtedDataSource.push({
            ...datasource,
            tableList: targetTableList,
            externalTablesList: targetExternalTableList,
          });
        }
      }
    }

    return getTreeData(filtedDataSource, true);
  }, [sourceSearchValue, databaseWithTableList]);

  /**
   * 已选择的所有库表(按搜索条件过滤) 右侧数据
   */
  const selectedTreeData = useMemo(() => {
    try {
      const filtedDataSource: IDataBaseWithTable[] = [];
      for (const datasource of databaseWithTableList) {
        let { tableList, id: databaseId, name: databaseName, externalTablesList } = datasource;

        const checkedTableNames = tableList.filter((item) =>
          checkedKeys.includes(
            generateKeyByDataBaseIdAndTableName({
              databaseId,
              tableName: item.name,
              tableId: item.id,
            }),
          ),
        );

        const externalTableTableNames = externalTablesList?.filter((item) => {
          return checkedKeys.includes(
            generateKeyByDataBaseIdAndTableName({
              databaseId,
              tableName: item.name,
              tableId: item.id,
            }),
          );
        });

        if (!checkedTableNames?.length && !externalTableTableNames?.length) {
          continue;
        }

        if (databaseName.includes(targetSearchValue) || !targetSearchValue) {
          filtedDataSource.push({
            ...datasource,
            tableList: checkedTableNames,
            externalTablesList: externalTableTableNames,
          });
        } else {
          const searchedTableList = checkedTableNames.filter((item) =>
            item?.name.includes(targetSearchValue),
          );
          const searchedExternalTableTableList = externalTableTableNames.filter((item) =>
            item?.name.includes(targetSearchValue),
          );

          if (searchedTableList.length > 0 || searchedExternalTableTableList.length > 0) {
            filtedDataSource.push({
              ...datasource,
              tableList: searchedTableList,
              externalTablesList: searchedExternalTableTableList,
            });
          }
        }
      }
      return getTreeData(filtedDataSource, false);
    } catch (err) {}
  }, [databaseWithTableList, checkedKeys, targetSearchValue]);

  /**
   * 点击删除已选中的选项
   */
  const handleDelete = useCallback(
    (node: DataNode) => {
      const { key, children, isLeaf } = node;
      let remainKeys = [];
      if (isNumber(key)) {
        /**
         * delete database
         */
        const db = databaseWithTableList?.find((_db) => _db.id === key);
        const tableIds = []
          .concat(db.tableList || [])
          .concat(db.externalTablesList || [])
          ?.map((t) => t.id);
        remainKeys = checkedKeys.filter(
          (key) => !tableIds.includes(parseDataBaseIdAndTableNamebByKey(key)?.tableId),
        );
      } else if (!isLeaf) {
        /**
         * delete table group
         */
        const [databaseId, type] = key.split('-');
        const db = databaseWithTableList?.find((_db) => _db.id === Number(databaseId));
        if (!db) {
          return;
        }
        let tables = db?.tableList;
        if (type == 'externalTable') {
          tables = db?.externalTablesList;
        }
        const tableIds = new Set(tables?.map((table) => table.id));
        remainKeys = checkedKeys.filter((key) => {
          return !tableIds.has(parseDataBaseIdAndTableNamebByKey(key)?.tableId);
        });
      } else {
        const nodeKey = key as string;
        remainKeys = checkedKeys.filter((key) => key !== nodeKey);
      }
      const newValue = remainKeys.map(parseDataBaseIdAndTableNamebByKey);
      onChange(newValue);
      const willExpandKeys: number[] = newValue.map(({ databaseId }) => databaseId);
      setSelectedExpandKeys(Array.from(new Set(willExpandKeys)));
    },
    [checkedKeys, onChange, databaseWithTableList],
  );

  /**
   * 获取库下的表list
   */
  const getTableList = async (
    databaseId,
  ): Promise<{
    tables: {
      name: string;
      id: number;
      databaseId: number;
    }[];
    externalTables: {
      name: string;
      id: number;
      databaseId: number;
    }[];
  }> => {
    const db = databaseWithTableList?.find((_db) => _db.id === databaseId);
    let tables: { name: string; id: number; databaseId: number }[];
    let externalTables: { name: string; id: number; databaseId: number }[];
    if (isLogicalDatabase(db)) {
      const res = await logicalDatabaseDetail(databaseId);
      tables = res?.data?.logicalTables?.map((table) => ({
        name: table.name,
        id: table.id,
        databaseId,
      }));
    } else {
      const params: DbObjectType[] = [DbObjectType.table, DbObjectType.external_table];
      const res = await getTableListWithoutSession(db?.id, params.join(','));
      tables = res
        ?.filter((item) => item.type === DbObjectType.table)
        ?.map((table) => ({
          name: table.name,
          id: table.id,
          databaseId: table.database.id,
        }));
      externalTables = res
        ?.filter((item) => item.type === DbObjectType.external_table)
        ?.map((table) => ({
          name: table.name,
          id: table.id,
          databaseId: table.database.id,
        }));
    }
    return {
      tables,
      externalTables,
    };
  };

  /**
   * 加载库里包含的表
   */
  const handleLoadTables = useCallback(
    async (databaseId: number) => {
      if (typeof databaseId === 'string') return;
      let { tables, externalTables } = (await getTableList(databaseId)) || {};

      setDataBaseWithTableList((prevData) => {
        for (const item of prevData ?? []) {
          if (item.id === databaseId) {
            item.tableList = tables;
            item.hasGetTableList = true;
            item.externalTablesList = externalTables;
            return [...prevData];
          }
        }
      });
      return {
        tables,
        externalTables,
      };
    },
    [databaseWithTableList],
  );
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

  /**
   * 树选择
   */
  const handleChosenTable: TreeProps['onCheck'] = useCallback(
    async (_checkedKeys: string[], { checked, node }) => {
      const { key: curNodeKey, isLeaf } = node as tableTreeEventDataNode;
      if (isNumber(curNodeKey)) {
        /**
         * 选中整个库，需要自动获取并选中所有的表
         */
        if (checked) {
          setSelecting(true);
          try {
            const { tables, externalTables } = await handleLoadTables(curNodeKey);
            const tableList = [...checkedKeys.map(parseDataBaseIdAndTableNamebByKey)];
            tables?.forEach((table) => {
              tableList.push({
                databaseId: table?.databaseId,
                tableName: table?.name,
                tableId: table?.id,
              });
            });
            externalTables?.forEach((table) => {
              tableList.push({
                databaseId: table?.databaseId,
                tableName: table?.name,
                tableId: table?.id,
              });
            });
            onChange(tableList);
            setSelectedExpandKeys(tableList.map((i) => i.databaseId));
          } finally {
            setSelecting(false);
          }
        } else {
          const db = databaseWithTableList?.find((_db) => _db.id === curNodeKey);
          if (!db) {
            return;
          }
          const targetDBTablesId = []
            .concat(db.tableList || [])
            .concat(db.externalTablesList || [])
            ?.map((t) => t.id);
          const tableList = [...checkedKeys.map(parseDataBaseIdAndTableNamebByKey)].filter((i) => {
            return !targetDBTablesId.includes(i.tableId);
          });
          onChange(tableList);
          setSelectedExpandKeys(tableList.map((i) => i.databaseId));
        }
      } else if (!isLeaf) {
        /**
         * 选中外表或者表的group
         */
        const [databaseId, type] = curNodeKey.split('-');
        const db = databaseWithTableList?.find((_db) => _db.id === Number(databaseId));
        if (!db) {
          return;
        }
        let tables = db?.tableList;
        let externalTables = db?.externalTablesList;
        let tableIds = new Set(tables.map((table) => table?.id));

        if (type == 'externalTable') {
          tables = db?.externalTablesList;
          tableIds = new Set(externalTables?.map((table) => table?.id));
        }
        let tableList = [...checkedKeys.map(parseDataBaseIdAndTableNamebByKey)];
        if (checked) {
          tables?.forEach((table) => {
            tableList.push({
              databaseId: toNumber(databaseId),
              tableName: table?.name,
              tableId: table?.id,
            });
          });
        } else {
          tableList = tableList.filter((i) => {
            return !tableIds.has(i.tableId);
          });
        }
        onChange(tableList);
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
    [checkedKeys, onChange, handleLoadTables],
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
      <div className={classnames(styles.content, styles.hasIconTree)}>
        <Spin spinning={isLoading || selecting}>
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
              onExpand={(keys, a) => {
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
              defaultMessage: '已选 {selectedTreeDataCount} 项',
            },
            { selectedTreeDataCount },
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
