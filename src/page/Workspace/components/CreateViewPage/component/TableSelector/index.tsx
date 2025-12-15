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

import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { Button, Empty, Spin, Transfer, Tree } from 'antd';
import { uniqueId } from 'lodash';
import { parse } from 'query-string';
import styles from './index.less';
import React, { useEffect, useMemo, useState } from 'react';
import TableItem from './Item';
import { ICON_DATABASE, ICON_TABLE, ICON_VIEW } from '../ObjectName';
import SortableContainer, { DraggableItem } from '@/component/SortableContainer';

const { TreeNode, DirectoryTree } = Tree;

interface IProps {
  onSubmit: (values: any) => void;
  session: SessionStore;
}

interface IState {
  targetKeys: any[];
  treeData: any[];
  expandedKeys: any[];
  autoExpandParent: boolean;
  selectMap: object;
  keywords: string;
  loading: boolean;
}

const TreeSelector: React.FC<IProps> = React.memo((props) => {
  const selectedKeys = [];
  const [state, setState] = useState<IState>({
    targetKeys: [],
    treeData: [],
    expandedKeys: [],
    autoExpandParent: true,
    selectMap: {},
    keywords: '',
    loading: true,
  });
  useEffect(() => {
    loadTreeData(true);
  }, []);

  const loadTreeData = async (isInit: boolean) => {
    const { session } = props;
    setState({ ...state, loading: true });
    await session.queryTablesAndViews('', true);
    const treeData = Object.entries(session.allTableAndView)?.map(([dbName, obj]) => {
      const { tables, views } = obj;
      return {
        title: dbName,
        key: `d=${dbName}`,
        type: 'DB',
        children: tables
          .map((tableName) => {
            return {
              type: 'TABLE',
              key: `d=${dbName}&t=${encodeURIComponent(tableName)}`,
              title: tableName,
            };
          })
          .concat(
            views.map((viewName) => {
              return {
                type: 'VIEW',
                key: `d=${dbName}&v=${encodeURIComponent(viewName)}`,
                title: viewName,
              };
            }),
          ),
      };
    });
    setState({
      ...state,
      treeData,
      // 默认展开第 0 项
      expandedKeys: isInit && treeData.length ? [treeData[0].key] : state.expandedKeys,
      loading: false,
    });
  };

  const handleTreeNodeSelect = (item, selectedKeys, onItemSelect) => {
    const { eventKey } = item.node.props;
    const isChecked = selectedKeys.indexOf(eventKey) !== -1;
    console.log(!isChecked, eventKey);
    onItemSelect(eventKey, !isChecked);
  };

  const handleTreeSearch = (_, keywords) => {
    const { treeData } = state;
    const expandedKeys = [];
    if (keywords) {
      treeData.forEach((node) => {
        const { children = [] } = node;
        const isMatch = children.find((item) => {
          const upperKeywords = keywords.toUpperCase();
          const upperItemKey = item.key.toUpperCase();
          return upperItemKey.indexOf(upperKeywords) > -1 || selectedKeys.includes(item.key);
        });
        if (isMatch) {
          expandedKeys.push(node.key);
        }
      });
    }
    setState({ ...state, keywords, expandedKeys });
  };

  const handleTransfer = (nextTargetKeys, direction?, moveKeys?) => {
    const { targetKeys } = state;
    let newKeys = [];
    if (moveKeys) {
      // 在后面追加
      // @see https://github.com/ant-design/ant-design/issues/28328
      newKeys = [].concat(targetKeys, moveKeys || []);
    } else {
      newKeys = nextTargetKeys;
    }
    // 存在同表多选情况，需要 uid 做唯一标识
    newKeys = newKeys.map((key) =>
      key.indexOf('uid') !== -1 ? key : `${key}&uid=${uniqueId('t_')}`,
    );
    setState({ ...state, targetKeys: [...newKeys] });
  };

  const handleItemDelete = (key: React.Key) => {
    const { targetKeys } = state;
    const index = targetKeys.findIndex((item) => item === key);
    if (targetKeys) {
      targetKeys.splice(index, 1);
      handleTransfer(targetKeys, null, null);
    }
  };

  const handleSubmit = () => {
    const { targetKeys, selectMap } = state;
    const operations = [];
    const viewUnits = targetKeys.map((key, index) => {
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
    props.onSubmit({ viewUnits, operations });
  };

  const handleItemChange = (data) => {
    const { dataKey } = data;
    const { selectMap } = state;
    if (!selectMap[dataKey]) {
      selectMap[dataKey] = { ...data };
    } else {
      selectMap[dataKey] = { ...selectMap[dataKey], ...data };
    }
    setState({ ...state, selectMap });
  };

  const renderTree = (treeNodes = [], selectedKeys = []) => {
    const { keywords, targetKeys } = state;
    return treeNodes.map((data) => {
      const { children, title, key, type } = data;
      const isChecked = selectedKeys.indexOf(key) !== -1;
      const isLeaf = /TABLE|VIEW/.test(type);
      const icon = type === 'DB' ? ICON_DATABASE : type === 'TABLE' ? ICON_TABLE : ICON_VIEW;
      // 如果有搜索词的过滤
      if (keywords) {
        const upperCaseTitle = title.toUpperCase();
        const upperKeywords = keywords.toUpperCase();
        if (isLeaf && !upperCaseTitle.includes(upperKeywords) && !isChecked) {
          return null;
        }
      }

      return (
        <TreeNode
          title={title}
          key={key}
          icon={icon}
          isLeaf={isLeaf}
          checkable={isLeaf}
          selectable={false}
        >
          {renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  const renderSourcePanel = (onItemSelect, selectedKeys) => {
    const { targetKeys, treeData, expandedKeys, loading, autoExpandParent } = state;
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
        style={{ height: '225px', overflowY: 'auto', overflowX: 'auto' }}
        height={225}
        checkedKeys={selectedKeys}
        onExpand={(expandedKeys) => {
          setState({
            ...state,
            expandedKeys,
            autoExpandParent: false,
          });
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

  const renderTargetPanel = () => {
    const { targetKeys } = state;
    if (!targetKeys.length) {
      return <Empty style={{ marginTop: '80px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div style={{ height: '262px', overflow: 'auto' }}>
        <SortableContainer
          list={targetKeys}
          onDrapEnd={(list) => {
            setState({ ...state, targetKeys: list });
          }}
        >
          {targetKeys.map((targetKey, index) => {
            return (
              <DraggableItem id={targetKey} key={targetKey}>
                <TableItem
                  key={targetKey}
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
  /**
   * treeData 打平成 { key, value }
   */
  const dataSource = useMemo(() => {
    const { treeData } = state;
    const result = [];
    function flatten(data) {
      data.forEach((item) => {
        const { children, title, key, type } = item;
        result.push({ key, value: title });
        if (children) {
          flatten(children);
        }
      });
    }
    flatten(treeData);
    return result;
  }, [state.treeData]);
  return (
    <div>
      <Transfer
        showSearch={!state.loading}
        targetKeys={state.targetKeys}
        dataSource={dataSource}
        showSelectAll
        className={styles['tree-transfer']}
        locale={{
          searchPlaceholder: formatMessage({
            id: 'odc.component.TableSelector.EnterATableOrView',
            defaultMessage: '请输入表/视图名称',
          }), // 请输入表/视图名称
        }}
        onChange={handleTransfer}
        onSearch={handleTreeSearch}
        filterOption={() => true}
        oneWay
      >
        {({ direction, onItemSelect, selectedKeys }) => {
          if (direction === 'left') {
            selectedKeys = selectedKeys;
            return renderSourcePanel((key: any, check: boolean) => {
              console.log(key, check);
              onItemSelect(key, check);
            }, selectedKeys);
          }

          if (direction === 'right') {
            return renderTargetPanel();
          }
        }}
      </Transfer>
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        {
          formatMessage({
            id: 'odc.component.TableSelector.Determine',
            defaultMessage: '确定',
          }) /* 确定 */
        }
      </Button>
    </div>
  );
});

export default TreeSelector;
