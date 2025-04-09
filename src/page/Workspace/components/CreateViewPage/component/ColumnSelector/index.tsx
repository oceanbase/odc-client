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
import { Button, Checkbox, Empty, Spin, Transfer, Tree } from 'antd';

import update from 'immutability-helper';
import { parse } from 'query-string';
import styles from './index.less';
import React, { useEffect, useMemo, useState } from 'react';
import { fieldIconMap } from '@/constant';
import { ColumnShowType } from '@/d.ts';
import { isEqual, uniqueId } from 'lodash';
import { ICON_DATABASE, ICON_TABLE, ICON_VIEW } from '../ObjectName';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { convertDataTypeToDataShowType } from '@/util/utils';
import ColumnItem from './Item';
import { getTableColumnList } from '@/common/network/table';
import { getView } from '@/common/network/view';
import SortableContainer, { DraggableItem } from '@/component/SortableContainer';
const { TreeNode, DirectoryTree } = Tree;

interface IProps {
  session: SessionStore;
  onSubmit: (values: any) => void;
  viewUnits: any[];
}

const ColumnIcon = ({ dataShowType }: { dataShowType: ColumnShowType }) => (
  <Icon
    component={fieldIconMap[dataShowType]}
    style={{
      fontSize: 16,
      color: '#3FA3FF',
      marginRight: 4,
      verticalAlign: 'middle',
    }}
  />
);

const TreeSelector: React.FC<IProps> = React.memo((props) => {
  const selectedKeys = [];
  const [state, setState] = useState({
    targetKeys: [],
    expandedKeys: [],
    treeData: [],
    selectMap: {},
    keywords: '',
    autoExpandParent: true,
    loading: true,
  });
  useEffect(() => {
    loadTreeData(props.viewUnits);
  }, []);

  const handleSelectAll = (e, onItemSelectAll) => {
    const { checked } = e.target;
    const keys = getTreeKeys({
      children: state.treeData,
    });

    onItemSelectAll(keys, checked);
  };

  const renderSourcePanel = (onItemSelectAll, selectedKeys) => {
    const { targetKeys, treeData, loading, autoExpandParent } = state;
    if (loading) {
      return <Spin className={styles.spin} />;
    }
    const allKeys = getTreeKeys({ children: treeData });
    const selectKeysObject = {};
    selectedKeys.forEach((key) => {
      selectKeysObject[key] = true;
    });
    const hasNoSelect = allKeys.find((key) => !selectKeysObject[key]);

    return (
      <>
        <Checkbox
          className={styles.checkboxAll}
          checked={!hasNoSelect}
          onChange={(e) => {
            handleSelectAll(e, onItemSelectAll);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.ColumnSelector.AllFields',
              defaultMessage: '全部字段',
            }) /* 全部字段 */
          }
        </Checkbox>
        <DirectoryTree
          blockNode
          defaultExpandAll
          autoExpandParent={autoExpandParent}
          checkable
          checkStrictly
          style={{ height: '186px', overflowY: 'auto', overflowX: 'auto' }}
          checkedKeys={selectedKeys}
          onExpand={(expandedKeys) => {
            setState({
              ...state,
              expandedKeys,
              autoExpandParent: false,
            });
          }}
          onCheck={(_, item) => {
            // @ts-ignore
            const { eventKey } = item.node.props;
            const isChecked = selectedKeys.indexOf(eventKey) !== -1;
            const keys = getTreeKeys(item.node);
            onItemSelectAll(keys, !isChecked);
          }}
        >
          {renderTree(treeData, selectedKeys)}
        </DirectoryTree>
      </>
    );
  };

  const renderTargetPanel = () => {
    const { targetKeys, loading } = state;
    if (loading || !targetKeys.length) {
      return <Empty style={{ marginTop: '60px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <div style={{ height: '222px', overflow: 'auto' }}>
        <SortableContainer
          list={targetKeys}
          onDrapEnd={(list) => {
            setState({ ...state, targetKeys: list });
          }}
        >
          {targetKeys.map((targetKey) => {
            return (
              <DraggableItem id={targetKey} key={targetKey}>
                <ColumnItem
                  key={targetKey}
                  dataKey={targetKey}
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

  const renderTree = (treeNodes = [], selectedKeys = []) => {
    const { keywords, targetKeys } = state;
    const { session } = props;
    return treeNodes.map((item) => {
      const { children, title, type, key, ...props } = item;
      const params = parse(key);
      const { v, t, c, d, dataType } = params;
      const isChecked = selectedKeys.indexOf(key) !== -1;
      const isLeaf = !!c;
      const icon =
        d && !c && !t && !v ? (
          ICON_DATABASE
        ) : t && !c ? (
          ICON_TABLE
        ) : v && !c ? (
          ICON_VIEW
        ) : (
          <ColumnIcon
            dataShowType={convertDataTypeToDataShowType(`${dataType}`, session.dataTypes)}
          />
        );

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
          {...props}
          title={title}
          isLeaf={isLeaf}
          key={key}
          icon={icon}
          checkable
          selectable={!isLeaf}
          dataRef={item}
        >
          {renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  const loadTreeData = async (viewUnits) => {
    const { session } = props;
    setState({ ...state, loading: true });
    const treeData = [];
    const requests = [];
    const nodes = [];
    viewUnits.forEach((item) => {
      const { dbName, tableName, viewName, aliasName } = item;
      let root = treeData.find((item) => item.title === dbName);
      if (!root) {
        root = {
          key: `d=${dbName}`,
          title: dbName,
          children: [],
        };

        treeData.push(root);
      }

      const node = {
        key: `d=${dbName}&${tableName ? `t=${tableName}` : `v=${viewName}`}${
          aliasName ? `&aliasName=${aliasName}` : ''
        }`,

        title: `${tableName || viewName}${aliasName ? `<${aliasName}>` : ''}`,
        children: [],
      };

      if (tableName) {
        requests.push(getTableColumnList(tableName, dbName, session?.sessionId));
        nodes.push(node);
      } else if (viewName) {
        requests.push(getView(viewName, session?.sessionId, dbName));
        nodes.push(node);
      }
      root.children.push(node);
    });
    const resList = await Promise.all(requests);
    resList.forEach((res, i) => {
      const node = nodes[i];
      const params = parse(node.key);
      const { v, t } = params;
      if (t) {
        node.children = res.map((col) => {
          return {
            key: `${node.key}&c=${col.columnName}&dataType=${col.dataType}`,
            title: col.columnName,
          };
        });
      } else if (v) {
        node.children = res.columns.map((col) => {
          return {
            key: `${node.key}&c=${col.columnName}&dataType=${col.dataType}`,
            title: col.columnName,
          };
        });
      }
    });
    setState({ ...state, treeData, loading: false, targetKeys: [] });
  };

  const UNSAFE_componentWillReceiveProps = async (nextProps) => {
    if (!isEqual(props.viewUnits, nextProps.viewUnits)) {
      await loadTreeData(nextProps.viewUnits);
    }
  };

  const handleSubmit = () => {
    const { targetKeys, selectMap } = state;
    const columns = [];
    targetKeys.forEach((key) => {
      const params = parse(key);
      const { d, v, t, c, aliasName: tableOrViewAliasName } = params;
      const { aliasName, columnName } = selectMap[key] || {};
      columns.push({
        dbName: d,
        tableName: t,
        tableOrViewAliasName,
        viewName: v,
        columnName: c || columnName,
        aliasName,
      });
    });
    props.onSubmit(columns);
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
    newKeys = newKeys.filter(
      (key) => key.indexOf('c=') > -1 || key.indexOf('odc.customer.column') > -1,
    );

    // 数组去重
    newKeys = Array.from(new Set(newKeys));
    // 存在同字段多选情况，需要 uid 做唯一标识
    newKeys = newKeys.map((key) =>
      key.indexOf('uid') !== -1 ? key : `${key}&uid=${uniqueId('c_')}`,
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

  const handleItemMove = (dragIndex: number, hoverIndex: number) => {
    const { targetKeys } = state;
    if (!targetKeys) {
      return;
    }
    const dragParam = targetKeys[dragIndex];
    const updateValue = update(targetKeys, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragParam],
      ],
    });

    handleTransfer(updateValue, null, null);
  };

  const handleItemChange = (data) => {
    const { dataKey } = data;
    const { selectMap } = state;
    if (!selectMap[dataKey]) {
      selectMap[dataKey] = { ...data };
    } else {
      selectMap[dataKey] = { ...selectMap[dataKey], ...data };
    }
    setState({
      ...state,
      selectMap,
    });
  };

  const handleItemAdd = () => {
    const { targetKeys } = state;
    setState({
      ...state,
      targetKeys: [...targetKeys, uniqueId('odc.customer.column_uid_')],
    });
  };

  const getTreeKeys = (root, keys?) => {
    const r = keys || [];
    const { children = [], key } = root;
    if (key) {
      r.push(key);
    }

    if (children.length) {
      children.forEach((child) => {
        getTreeKeys(child, r);
      });
    }
    return r;
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
        dataSource={dataSource}
        targetKeys={state.targetKeys}
        showSearch={!state.loading}
        showSelectAll
        className={styles['tree-transfer']}
        filterOption={() => true}
        titles={[
          null,
          <>
            <span className={styles['header-tip']}>
              {
                formatMessage({
                  id: 'odc.component.ColumnSelector.TipYouCanClickCustom',
                  defaultMessage: '提示：可点击自定义新建字段',
                }) /* 提示：可点击自定义新建字段 */
              }
            </span>
            <a onClick={handleItemAdd}>
              <PlusOutlined />
              {
                formatMessage({
                  id: 'odc.component.ColumnSelector.Custom',
                  defaultMessage: '自定义',
                }) /* 自定义 */
              }
            </a>
          </>,
        ]}
        locale={{
          searchPlaceholder: formatMessage({
            id: 'odc.component.ColumnSelector.EnterAFieldName',
            defaultMessage: '请输入字段名称',
          }), // 请输入字段名称
        }}
        onChange={handleTransfer}
        onSearch={handleTreeSearch}
        oneWay
      >
        {({ direction, selectedKeys, onItemSelectAll }) => {
          if (direction === 'left') {
            selectedKeys = selectedKeys;
            return renderSourcePanel(onItemSelectAll, selectedKeys);
          }
          if (direction === 'right') {
            return renderTargetPanel();
          }
        }}
      </Transfer>
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        {
          formatMessage({
            id: 'odc.component.ColumnSelector.Determine',
            defaultMessage: '确定',
          }) /* 确定 */
        }
      </Button>
    </div>
  );
});

export default TreeSelector;
