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
import { uniqueId, debounce } from 'lodash';
import MViewContext from '../context/MaterializedViewContext';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { TableSelectorNode } from '../interface';
import { Empty, Spin, Transfer, Tree } from 'antd';
import Icon from '@ant-design/icons';
import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import { ReactComponent as DatabaseSvg } from '@/svgr/database.svg';
import SortableContainer, { DraggableItem } from '@/component/SortableContainer';
import { DataNode } from 'antd/lib/tree';
import TableItem from '../../CreateViewPage/component/TableSelector/Item';
import { parse } from 'query-string';
import { useDataSourceConfig } from '../config';
import styles from '../index.less';
import { getJoinKeywords } from '../helper';
const { TreeNode, DirectoryTree } = Tree;

const TableSelector = () => {
  const mviewContext = useContext(MViewContext);
  const { setViewUnits, setOperations, session, info } = mviewContext;
  const [treeData, setTreeData] = useState<DataNode[]>();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [keywords, setKeyWords] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectMap, setSelectMap] = useState({});
  const datasourceConfig = useDataSourceConfig(session?.connection?.type);

  useEffect(() => {
    loadTreeData(true);
  }, []);

  const loadTreeData = async (isInit: boolean) => {
    setLoading(true);
    const data = await session.queryTablesAndMaterializedViews('', true);
    const _treeData = Object.entries(data)?.map(([dbName, obj]) => {
      const { tables, mvs } = obj;
      return {
        title: dbName,
        key: `d=${dbName}`,
        type: TableSelectorNode.database,
        children: [
          {
            title: formatMessage({
              id: 'src.page.Workspace.components.CreateMaterializedView.TableSelector.7234E38C',
              defaultMessage: '表',
            }),
            key: `${TableSelectorNode.database}-${dbName}-${TableSelectorNode.tableRoot}`,
            type: TableSelectorNode.tableRoot,
            children: tables?.map((tableName) => ({
              title: tableName,
              key: `d=${dbName}&t=${encodeURIComponent(tableName)}`,
              type: TableSelectorNode.table,
            })),
          },
          {
            title: formatMessage({
              id: 'src.page.Workspace.components.CreateMaterializedView.TableSelector.6EFF8857',
              defaultMessage: '物化视图',
            }),
            key: `${TableSelectorNode.database}-${dbName}-${TableSelectorNode.materializedViewRoot}`,
            type: TableSelectorNode.materializedViewRoot,
            children: mvs?.map((mvName) => ({
              title: mvName,
              key: `d=${dbName}&v=${encodeURIComponent(mvName)}`,
              type: TableSelectorNode.materializedView,
            })),
          },
        ],
      };
    });
    if (isInit && _treeData.length) {
      // 默认展开第一项
      setExpandedKeys([
        _treeData[0]?.key,
        _treeData[0]?.children?.[0]?.key,
        _treeData[0]?.children?.[1]?.key,
      ]);
    }
    setTreeData(_treeData);
    setLoading(false);
  };

  const getIcon = (type: TableSelectorNode) => {
    let icon;
    switch (type) {
      case TableSelectorNode.database: {
        icon = <Icon component={DatabaseSvg} style={{ color: '#3FA3FF', fontSize: 14 }} />;
        break;
      }
      case TableSelectorNode.table: {
        icon = (
          <TableOutlined
            style={{
              color: '#3FA3FF',
            }}
          />
        );

        break;
      }
      case TableSelectorNode.materializedView: {
        icon = (
          <Icon
            type="view"
            component={ViewSvg}
            style={{
              color: 'var(--icon-color-5)',
              position: 'relative',
              top: 1,
            }}
          />
        );

        break;
      }
    }
    return icon;
  };

  const renderTree = (treeNodes = [], selectedKeys = []) => {
    return treeNodes.map((data) => {
      const { children, title, key, type } = data;
      const isChecked = selectedKeys?.indexOf(key) !== -1;
      const isBottomNode = !children;
      if (keywords) {
        const upperCaseTitle = title.toUpperCase();
        const upperKeywords = keywords.toUpperCase();
        if (isBottomNode && !upperCaseTitle.includes(upperKeywords) && !isChecked) {
          return null;
        }
      }
      return (
        <TreeNode
          title={title}
          key={key}
          isLeaf={isBottomNode}
          icon={getIcon(type)}
          checkable={isBottomNode}
          selectable={false}
        >
          {renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  const handleTreeNodeSelect = (item, selectedKeys, onItemSelect) => {
    const { eventKey } = item.node.props;
    const isChecked = selectedKeys?.indexOf(eventKey) !== -1;
    onItemSelect(eventKey, !isChecked);
  };

  const renderSourcePanel = (onItemSelect?, selectedKeys?) => {
    if (loading) {
      return <Spin className={styles.spin} />;
    }
    return (
      <DirectoryTree
        blockNode
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        checkable
        checkStrictly
        style={{ height: '425px', overflowY: 'auto', overflowX: 'auto' }}
        height={425}
        checkedKeys={selectedKeys}
        onExpand={(expandedKeys) => {
          setExpandedKeys(expandedKeys);
          setAutoExpandParent(false);
        }}
        onCheck={(_, item) => {
          handleTreeNodeSelect(item, selectedKeys, onItemSelect);
        }}
        onSelect={(_, item) => {
          handleTreeNodeSelect(item, selectedKeys, onItemSelect);
        }}
      >
        {renderTree(treeData, selectedKeys)}
      </DirectoryTree>
    );
  };

  const handleSubmit = debounce((targetKeys) => {
    const operations = [];
    const viewUnits = targetKeys?.map((key, index) => {
      const isLast = targetKeys.length - 1 === index;
      const params = parse(key); // key 为 d=xxx&t=xxx&v=xxx
      const { aliasName, operation } = selectMap[key] || {};
      const r = {
        dbName: params.d,
        tableName: params.t,
        viewName: params.v,
        aliasName,
      };
      if (!isLast) {
        operations.push(operation || ',');
      }
      return r;
    });
    setViewUnits(viewUnits);
    setOperations(operations);
  }, 200);

  const handleTransfer = (nextTargetKeys, direction?, moveKeys?) => {
    let newKeys = [];
    if (moveKeys) {
      newKeys = [].concat(targetKeys, moveKeys || []);
    } else {
      newKeys = nextTargetKeys;
    }
    // 存在同表多选情况，需要 uid 做唯一标识
    newKeys = newKeys.map((key) =>
      key.indexOf('uid') !== -1 ? key : `${key}&uid=${uniqueId('t_')}`,
    );
    setTargetKeys([...newKeys]);
    handleSubmit([...newKeys]);
  };

  const handleTreeSearch = (_, keywords) => {
    setKeyWords(keywords);
  };

  const handleItemChange = (data) => {
    const { dataKey } = data;
    if (!selectMap[dataKey]) {
      selectMap[dataKey] = { ...data };
    } else {
      selectMap[dataKey] = { ...selectMap[dataKey], ...data };
    }
    setSelectMap(selectMap);
    handleSubmit(targetKeys);
  };

  const handleItemDelete = (key: React.Key) => {
    const index = targetKeys.findIndex((item) => item === key);
    if (targetKeys) {
      targetKeys.splice(index, 1);
      handleTransfer(targetKeys, null, null);
    }
  };

  const dataSource = useMemo(() => {
    const result = [];
    function flatten(data) {
      data?.forEach((item) => {
        const { children, title, key, type } = item;
        result.push({ key, value: title });
        if (children) {
          flatten(children);
        }
      });
    }
    flatten(treeData);
    return result;
  }, [treeData]);

  const renderTargetPanel = () => {
    if (!targetKeys.length) {
      return <Empty style={{ marginTop: '80px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <div style={{ height: '462px', overflow: 'auto' }}>
        <SortableContainer
          list={targetKeys}
          onDrapEnd={(list) => {
            setTargetKeys(list);
          }}
        >
          {targetKeys.map((targetKey, index) => {
            return (
              <DraggableItem id={targetKey} key={targetKey}>
                <TableItem
                  joinKeywords={getJoinKeywords(info?.refreshMethod)}
                  caseSensitive={datasourceConfig?.sql?.caseSensitivity}
                  escapes={datasourceConfig?.sql?.escapeChar}
                  key={targetKey}
                  useCaseInput
                  dataKey={targetKey}
                  isLast={index === targetKeys.length - 1}
                  handleChange={handleItemChange}
                  handleDelete={handleItemDelete}
                />
              </DraggableItem>
            );
          })}
        </SortableContainer>
      </div>
    );
  };

  return (
    <div style={{ padding: '12px' }}>
      <p>
        {formatMessage({
          id: 'src.page.Workspace.components.CreateMaterializedView.TableSelector.7AFF6985',
          defaultMessage: '选择基表',
        })}

        <span style={{ color: 'var(--icon-color-normal-2)' }}>
          {formatMessage({
            id: 'src.page.Workspace.components.CreateMaterializedView.TableSelector.8DEC2BED',
            defaultMessage: '（可选）',
          })}
        </span>
      </p>
      <Transfer
        showSearch={!loading}
        targetKeys={targetKeys}
        dataSource={dataSource}
        showSelectAll
        className={styles['mv-tree-transfer']}
        locale={{
          searchPlaceholder: formatMessage({
            id: 'src.page.Workspace.components.CreateMaterializedView.TableSelector.AA55002C',
            defaultMessage: '请输入表/物化视图名称',
          }),
        }}
        onChange={handleTransfer}
        onSearch={handleTreeSearch}
        filterOption={() => true}
        oneWay
      >
        {({ direction, onItemSelect, selectedKeys }) => {
          if (direction === 'left') {
            return renderSourcePanel(onItemSelect, selectedKeys);
          }
          if (direction === 'right') {
            return renderTargetPanel();
          }
        }}
      </Transfer>
    </div>
  );
};

export default TableSelector;
