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
import { Badge, Popconfirm, Space, Spin, Tree, Typography } from 'antd';
import { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import classnames from 'classnames';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { isNumber, toNumber } from 'lodash';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import datasourceStatus from '@/store/datasourceStatus';
import { isLogicalDatabase } from '@/util/database';
import { logicalDatabaseDetail } from '@/common/network/logicalDatabase';
import { DbObjectType } from '@/d.ts';

import {
  IDataBaseWithTable,
  LoadTableItems,
  TableItem,
  TableItemInDB,
  TableSelecterRef,
  tableTreeEventDataNode,
} from './interface';
import { DbObjectTypeTextMap } from '@/constant/label';
import { ApplyDatabaseAuthEmpty } from '@/component/Empty/ApplyDatabaseAuthEmpty';

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
    const {
      id,
      name,
      tableList,
      dataSource,
      externalTablesList,
      viewList,
      hasGetTableList,
      materializedViewList,
      environment,
    } = database;

    let children = [];

    const childrenForTable = treeChildrenHelper(tableList, DbObjectType.table);
    const childrenForExternalTable = treeChildrenHelper(
      externalTablesList,
      DbObjectType.external_table,
    );
    const childrenForView = treeChildrenHelper(viewList, DbObjectType.view);
    const childrenForMaterializedView = treeChildrenHelper(
      materializedViewList,
      DbObjectType.materialized_view,
    );

    children = !hasGetTableList
      ? []
      : [
          childrenForTable,
          childrenForExternalTable,
          childrenForView,
          childrenForMaterializedView,
        ]?.filter(Boolean);

    const getTotalCount = (tableList, externalTablesList, viewList, materializedViewList) => {
      return (
        (tableList?.length || 0) +
        (externalTablesList?.length || 0) +
        (viewList?.length || 0) +
        (materializedViewList?.length || 0)
      );
    };

    return {
      title: (
        <Space size={2}>
          <Text
            ellipsis
            style={{ wordBreak: 'keep-all', paddingLeft: 4, maxWidth: 160 }}
            title={name}
          >
            {name}
          </Text>
          <Text type="secondary" ellipsis style={{ maxWidth: 80 }} title={dataSource?.name}>
            {dataSource?.name}
          </Text>
          <Text type="secondary" ellipsis>
            {hasGetTableList && isSourceTree
              ? `(${getTotalCount(tableList, externalTablesList, viewList, materializedViewList)})`
              : ''}
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

    function treeChildrenHelper(objectList: TableItemInDB[], objectType: DbObjectType) {
      return {
        title: DbObjectTypeTextMap(objectType),
        key: `${id}-${objectType}`,
        selectable: false,
        disabled: hasGetTableList && objectList?.length === 0,
        children: objectList?.map((tableItem) => ({
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
    }
  });
  return allTreeData;
};

const getObjectTypeFromPosition = (position: string): DbObjectType => {
  switch (position) {
    case '0':
      return DbObjectType.table;
    case '1':
      return DbObjectType.external_table;
    case '2':
      return DbObjectType.view;
    case '3':
      return DbObjectType.materialized_view;
    default:
      return DbObjectType.table;
  }
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
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await listDatabases({
        projectId,
        existed: true,
        includesPermittedAction: true,
      });
      if (res?.contents) {
        datasourceStatus.asyncUpdateStatus(
          res?.contents
            ?.filter((item) => item.type !== 'LOGICAL' && !!item.dataSource?.id)
            ?.map((item) => item?.dataSource?.id),
        );
        // 过滤掉对象存储的数据源
        const list: IDataBaseWithTable[] = res.contents
          .filter((item) => {
            return !isConnectTypeBeFileSystemGroup(item.connectType) && !isLogicalDatabase(item);
          })
          .map((db) => {
            return {
              ...db,
              tableList: [],
              externalTablesList: [],
              viewList: [],
              materializedViewList: [],
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
      let { tableList, name, externalTablesList, viewList, materializedViewList } = datasource;
      if (name?.toLowerCase().includes(sourceSearchValue?.toLowerCase())) {
        filtedDataSource.push(datasource);
      } else {
        const targetTableList = tableList.filter((item) => item?.name?.includes(sourceSearchValue));
        const targetExternalTableList = externalTablesList?.filter((item) =>
          item?.name?.includes(sourceSearchValue),
        );
        const targetViewList = viewList?.filter((item) => item?.name?.includes(sourceSearchValue));
        const targetmaterializedViewList = materializedViewList?.filter((item) =>
          item?.name?.includes(sourceSearchValue),
        );
        if (targetTableList.length > 0) {
          filtedDataSource.push({
            ...datasource,
            tableList: targetTableList,
            externalTablesList: targetExternalTableList,
            viewList: targetViewList,
            materializedViewList: targetmaterializedViewList,
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
        let {
          tableList,
          id: databaseId,
          name: databaseName,
          externalTablesList,
          viewList,
          materializedViewList,
        } = datasource;

        function checkedTableNamesHelper(list: TableItemInDB[]) {
          return list.filter((item) =>
            checkedKeys.includes(
              generateKeyByDataBaseIdAndTableName({
                databaseId,
                tableName: item.name,
                tableId: item.id,
              }),
            ),
          );
        }

        const checkedTableNames = checkedTableNamesHelper(tableList);
        const externalTableTableNames = checkedTableNamesHelper(externalTablesList);
        const viewNames = checkedTableNamesHelper(viewList);
        const materializedViewNames = checkedTableNamesHelper(materializedViewList);

        if (
          !checkedTableNames?.length &&
          !externalTableTableNames?.length &&
          !viewNames?.length &&
          !materializedViewNames?.length
        ) {
          continue;
        }

        if (databaseName.includes(targetSearchValue) || !targetSearchValue) {
          filtedDataSource.push({
            ...datasource,
            tableList: checkedTableNames,
            externalTablesList: externalTableTableNames,
            viewList: viewNames,
            materializedViewList: materializedViewNames,
          });
        } else {
          const searchedTableListHelper = (nameList: TableItemInDB[]) => {
            return nameList.filter((item) => item?.name.includes(targetSearchValue));
          };
          const searchedTableList = searchedTableListHelper(checkedTableNames);
          const searchedExternalTableTableList = searchedTableListHelper(externalTableTableNames);
          const searchedViewList = searchedTableListHelper(viewNames);
          const searchedMaterializedViewList = searchedTableListHelper(materializedViewNames);

          if (
            searchedTableList.length > 0 ||
            searchedExternalTableTableList.length > 0 ||
            searchedViewList.length > 0 ||
            searchedMaterializedViewList?.length > 0
          ) {
            filtedDataSource.push({
              ...datasource,
              tableList: searchedTableList,
              externalTablesList: searchedExternalTableTableList,
              viewList: searchedViewList,
              materializedViewList: searchedMaterializedViewList,
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
          .concat(db.viewList || [])
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
        if (type == DbObjectType.external_table) {
          tables = db?.externalTablesList;
        }
        if (type == DbObjectType.view) {
          tables = db?.viewList;
        }
        if (type == DbObjectType.materialized_view) {
          tables = db?.materializedViewList;
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
      const newDatabaseIds = newValue.map(({ databaseId }) => databaseId);
      setSelectedExpandKeys((prevKeys) => {
        const prevKeysSet = new Set(prevKeys);
        newDatabaseIds.forEach((id) => prevKeysSet.add(id));
        return Array.from(prevKeysSet);
      });
    },
    [checkedKeys, onChange, databaseWithTableList],
  );

  /**
   * 获取库下的表list
   */
  const getTableList = async (
    databaseId,
  ): Promise<{
    tables: LoadTableItems[];
    externalTables: LoadTableItems[];
    views: LoadTableItems[];
    materializedViews: LoadTableItems[];
  }> => {
    const db = databaseWithTableList?.find((_db) => _db.id === databaseId);
    if (!db) return;
    let tables: LoadTableItems[];
    let externalTables: LoadTableItems[];
    let views: LoadTableItems[];
    let materializedViews: LoadTableItems[];
    if (isLogicalDatabase(db)) {
      const res = await logicalDatabaseDetail(databaseId);
      tables = res?.data?.logicalTables?.map((table) => ({
        name: table.name,
        id: table.id,
        databaseId,
      }));
    } else {
      const params: DbObjectType[] = [
        DbObjectType.table,
        DbObjectType.external_table,
        DbObjectType.view,
        DbObjectType.materialized_view,
      ];

      const res = await getTableListWithoutSession(db?.id, params.join(','));
      const listHelper = (type: DbObjectType) => {
        return res
          ?.filter((item) => item.type === type)
          ?.map((table) => ({
            name: table.name,
            id: table.id,
            databaseId: table.database.id,
          }));
      };
      tables = listHelper(DbObjectType.table);
      externalTables = listHelper(DbObjectType.external_table);
      views = listHelper(DbObjectType.view);
      materializedViews = listHelper(DbObjectType.materialized_view);
    }
    return {
      tables,
      externalTables,
      views,
      materializedViews,
    };
  };

  /**
   * 加载库里包含的表
   */
  const handleLoadTables = useCallback(
    async (databaseId: number) => {
      if (typeof databaseId === 'string') return;
      let { tables, externalTables, views, materializedViews } =
        (await getTableList(databaseId)) || {};

      setDataBaseWithTableList((prevData) => {
        for (const item of prevData ?? []) {
          if (item.id === databaseId) {
            item.tableList = tables;
            item.hasGetTableList = true;
            item.externalTablesList = externalTables;
            item.viewList = views;
            item.materializedViewList = materializedViews;
            return [...prevData];
          }
        }
      });
      return {
        tables,
        externalTables,
        views,
        materializedViews,
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
            const { tables, externalTables, views, materializedViews } = await handleLoadTables(
              curNodeKey,
            );
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
            views?.forEach((table) => {
              tableList.push({
                databaseId: table?.databaseId,
                tableName: table?.name,
                tableId: table?.id,
              });
            });
            materializedViews?.forEach((table) => {
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
            .concat(db.viewList || [])
            .concat(db.materializedViewList || [])
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
        let views = db?.viewList;
        let materializedViews = db?.materializedViewList;
        let tableIds = new Set(tables.map((table) => table?.id));

        if (type == DbObjectType.external_table) {
          tables = db?.externalTablesList;
          tableIds = new Set(externalTables?.map((table) => table?.id));
        }
        if (type == DbObjectType.materialized_view) {
          tables = db?.materializedViewList;
          tableIds = new Set(materializedViews?.map((table) => table?.id));
        }
        if (type == DbObjectType.view) {
          tables = db?.viewList;
          tableIds = new Set(views?.map((table) => table?.id));
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
          setSelectedExpandKeys([databaseId, curNodeKey]);
        } else {
          tableList = tableList.filter((i) => {
            return !tableIds.has(i.tableId);
          });
          setSelectedExpandKeys([toNumber(databaseId)]);
        }
        onChange(tableList);
      } else {
        const preCheckKeys = checked
          ? checkedKeys
          : checkedKeys.filter((key) => key !== curNodeKey);
        const newValue: TableItem[] = preCheckKeys.map(parseDataBaseIdAndTableNamebByKey);
        const tableItem = parseDataBaseIdAndTableNamebByKey(curNodeKey as string);
        const objectType = getObjectTypeFromPosition(node.pos.split('-')[2]);
        if (checked) {
          newValue.push(tableItem);
        }
        // 无论是选中还是取消选中，都保持当前层级展开
        setSelectedExpandKeys([tableItem.databaseId, `${tableItem.databaseId}-${objectType}`]);
        onChange(newValue);
      }
    },
    [checkedKeys, onChange, handleLoadTables, databaseWithTableList],
  );

  useImperativeHandle(
    ref,
    () => ({
      /**
       * 展开一个库下面的表
       * 目前用于SQL窗口中发起表权限申请时拉一下数据库数据
       */
      loadDatabases: loadDatabases,
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
      getAllLoadedTables: () => {
        return databaseWithTableList.reduce(
          (pre, cur) => pre.concat(cur.tableList, cur.viewList, cur.materializedViewList),
          [],
        );
      },
    }),
    [handleLoadTables, databaseWithTableList],
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
    const selectedTreeDataCount = [...new Set(checkedKeys)]?.length;
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
                    id: 'src.component.Task.component.TableSelecter.DA18FE81',
                    defaultMessage: '选择表/视图',
                  })}
                </span>
              </Space>
            }
            onSearch={setSourceSearchValue}
          >
            {allTreeData?.length > 0 ? (
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
            ) : (
              <ApplyDatabaseAuthEmpty
                description={
                  projectId
                    ? undefined
                    : formatMessage({
                        id: 'src.component.Task.component.TableSelecter.6D5646CD',
                        defaultMessage: '暂无数据',
                      })
                }
              />
            )}
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
                      <DeleteOutlined
                        style={{
                          color: node?.disabled
                            ? 'var(--icon-color-disable)'
                            : 'var(--icon-color-normal)',
                        }}
                      />
                    </a>
                  </div>
                );
              }}
            />
          ) : (
            <ApplyDatabaseAuthEmpty
              description={formatMessage({
                id: 'src.component.Task.component.TableSelecter.22E6453E',
                defaultMessage: '暂无数据',
              })}
            />
          )}
        </ExportCard>
      </div>
    </div>
  );
};

export default React.forwardRef(TableSelecter);
