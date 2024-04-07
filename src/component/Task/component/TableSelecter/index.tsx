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
import { generateDatabaseSidByDataBaseId } from '@/common/network/pathUtil';
import ExportCard from '@/component/ExportCard';
import DataBaseStatusIcon from '@/component/StatusIcon/DatabaseIcon';
import { IDatabase } from '@/d.ts/database';
import { TablePermissionType } from '@/d.ts/table';
import { SessionManagerStore } from '@/store/sessionManager';
import { ReactComponent as DatabaseSvg } from '@/svgr/database.svg';
import { ReactComponent as TableSvg } from '@/svgr/menuTable.svg';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Checkbox, Empty, Popconfirm, Space, Spin, Tree, Typography } from 'antd';
import { DataNode, EventDataNode, TreeProps } from 'antd/lib/tree';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';
import request from '@/util/request';

type TableItem = { databaseId: number; tableName: string };

type IProps = {
  sessionManagerStore?: SessionManagerStore;
  projectId: number;
  value?: TableItem[];
  stateId?: string;
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
/**
 * 库以及它下面的表的信息
 */
interface IDataBaseWithTable extends IDatabase {
  /**
   * 表列表
   */
  tableNames: string[];
}

const { Text } = Typography;

const KEY_SPLIT_CHAR = '-';
/**
 *  使用dataBaseId和tableName生成key 用于树节点的Key
 */
const generateKeyByDataBaseIdAndTableName = ({ databaseId, tableName }: TableItem) => {
  return `${databaseId}${KEY_SPLIT_CHAR}${tableName}`;
};
/**
 * 和generateKeyByDataBaseIdAndTableName配套使用
 * 解析Key中的dataBaseId和tableName
 */
const parseDataBaseIdAndTableNamebByKey = (key: string): TableItem => {
  const [databaseId, tableName] = key.split(KEY_SPLIT_CHAR);
  return { databaseId: Number(databaseId), tableName };
};

/**
 * 按库将表分组返回：
 * 目前value格式和详情接口返回的格式保持了一致
 * tips: 单个+批量提交时的参数类型可使用本方法获取
 * @param tables
 * @returns
 */
export const groupTableByDataBase = (
  tables: TableItem[],
): { databaseId: number; tableNames: string[] }[] => {
  const groupMap: { [databaseId: number]: string[] } = {};
  tables.forEach(({ databaseId, tableName }) => {
    if (groupMap[databaseId]) {
      groupMap[databaseId].push(tableName);
    } else {
      groupMap[databaseId] = [tableName];
    }
  });
  return Object.keys(groupMap).map((databaseId) => ({
    databaseId: Number(databaseId),
    tableNames: groupMap[databaseId],
  }));
};
/**
 * 将原始的IDataBaseWithTable数据转成TreeData格式
 * 仅叶子节点可以选择
 * @param validTableList
 * @returns
 */
const getTreeData = (validTableList: IDataBaseWithTable[]) => {
  const allTreeData = validTableList?.map((database) => {
    const { id, name, tableNames, dataSource } = database;
    const children = tableNames.map((tableName) => ({
      title: (
        <Space>
          <Text>{tableName}</Text>
        </Space>
      ),
      key: generateKeyByDataBaseIdAndTableName({ databaseId: id, tableName }),
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
        </Space>
      ),
      key: id,
      icon: <DataBaseStatusIcon item={database} />,
      checkable: false,
      expandable: true,
      children,
    };
  });
  return allTreeData;
};

const TableSelecter: React.ForwardRefRenderFunction<TableSelecterRef, IProps> = (
  { projectId, sessionManagerStore, value = [], onChange },
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
   * 获取项目下所有的库及其表
   */
  const loadDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listDatabases(projectId, null, null, null, null, null, null, true, true);
      if (res?.contents) {
        const list: IDataBaseWithTable[] = res.contents
          // .filter(({ authorizedPermissionTypes }) => authorizedPermissionTypes?.length)
          .map((db) => ({
            ...db,
            tableNames: [],
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
      return getTreeData(databaseWithTableList);
    }
    const filtedDataSource = [];
    for (const datasource of databaseWithTableList) {
      let { tableNames, name } = datasource;
      if (name.includes(sourceSearchValue)) {
        filtedDataSource.push(datasource);
      } else {
        const targetTableNames = tableNames.filter((name) => name?.includes(sourceSearchValue));
        if (targetTableNames.length > 0) {
          filtedDataSource.push({
            ...datasource,
            tableNames: targetTableNames,
          });
        }
      }
    }
    return getTreeData(filtedDataSource);
  }, [sourceSearchValue, databaseWithTableList]);

  /**
   * 已选择的所有库表(按搜索条件过滤)
   */
  const selectedTreeData = useMemo(() => {
    const filtedDataSource = [];
    for (const datasource of databaseWithTableList) {
      let { tableNames, id: databaseId, name: tableName } = datasource;
      const checkedTableNames = tableNames.filter((name) =>
        checkedKeys?.includes(generateKeyByDataBaseIdAndTableName({ databaseId, tableName: name })),
      );
      if (!checkedKeys.includes(String(databaseId)) && checkedTableNames.length < 1) {
        continue;
      }
      if (tableName.includes(targetSearchValue) || !targetSearchValue) {
        filtedDataSource.push({
          ...datasource,
          tableNames: checkedTableNames,
        });
      } else {
        const searchedTableName = checkedTableNames.filter((name) =>
          name.includes(targetSearchValue),
        );
        if (searchedTableName.length > 0) {
          filtedDataSource.push({
            ...datasource,
            tableNames: searchedTableName,
          });
        }
      }
    }
    return getTreeData(filtedDataSource);
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
      onChange(remainKeys.map(parseDataBaseIdAndTableNamebByKey));
    },
    [checkedKeys, onChange],
  );
  /**
   * 加载库里包含的表
   */
  const handleLoadTables = useCallback(
    async (databaseId: number) => {
      // TODO 由于此处依赖session， 后期会改成一个不依赖session的获取库下表列表的接口来做
      const dbSession = await sessionManagerStore.createSession(null, databaseId, true);
      if (dbSession && dbSession !== 'NotFound') {
        const { sessionId } = dbSession;
        await dbSession.database.getTableList();
        const tables = dbSession.database.tables || [];
        const tableNames = tables.map(({ info: { tableName } }) => tableName);
        setDataBaseWithTableList((prevData) => {
          for (const item of prevData) {
            if (item.id === databaseId) {
              item.tableNames = tableNames;
            }
          }
          return [...prevData];
        });
        sessionManagerStore.destorySession(sessionId);
      }
    },
    [sessionManagerStore],
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
   * 选中一张表后
   */
  const handleChosenTable: TreeProps['onCheck'] = useCallback(
    (_checkedKeys: string[]) => {
      const newValue: TableItem[] = [];
      const willExpandKeys: number[] = [];
      _checkedKeys.forEach((key) => {
        const tableItem = parseDataBaseIdAndTableNamebByKey(key);
        newValue.push(tableItem);
        willExpandKeys.push(tableItem.databaseId);
      });
      onChange(newValue);
      setSelectedExpandKeys(willExpandKeys);
    },
    [onChange],
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
                <Checkbox
                  indeterminate={indeterminate}
                  checked={checkAll}
                  disabled
                  style={{ marginRight: '8px' }}
                />
                <span>全部</span>
                <Text type="secondary">({allTreeDataCount})</Text>
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
          title={`已选 ${selectedTreeDataCount} 张表`}
          onSearch={(v) => setTargetSearchValue(v)}
          extra={
            <Popconfirm
              onConfirm={() => {
                onChange([]);
              }}
              placement="left"
              title="确定要清空已选对象吗？"
            >
              <a>清空</a>
            </Popconfirm>
          }
          disabled
        >
          {selectedTreeData?.length ? (
            <Tree
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

export default inject('sessionManagerStore')(observer(React.forwardRef(TableSelecter)));
