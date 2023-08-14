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

import { getTableColumnList } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { fieldIconMap } from '@/constant';
import { ColumnShowType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { convertDataTypeToDataShowType } from '@/util/utils';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Spin, Transfer, Tree } from 'antd';
import update from 'immutability-helper';
import { isEqual, uniqueId } from 'lodash';
import { parse } from 'query-string';
import { PureComponent } from 'react';
import { ICON_DATABASE, ICON_TABLE, ICON_VIEW } from '../ObjectName';
import styles from './index.less';
import ColumnItem from './Item';

const { TreeNode, DirectoryTree } = Tree;
interface IProps {
  session: SessionStore;
  onSubmit: (values: any) => void;
  viewUnits: any[];
}

interface IState {
  targetKeys: any[];
  treeData: any[];
  expandedKeys: any[];
  selectMap: object;
  keywords: string;
  loading: boolean;
  autoExpandParent: boolean;
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

export default class TreeSelector extends PureComponent<IProps, IState> {
  selectedKeys: any[];
  constructor(props) {
    super(props);
    this.selectedKeys = [];
    this.state = {
      targetKeys: [],
      expandedKeys: [],
      treeData: [],
      selectMap: {},
      keywords: '',
      autoExpandParent: true,
      loading: true,
    };
  }

  async componentDidMount() {
    await this.loadTreeData(this.props.viewUnits);
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.viewUnits, nextProps.viewUnits)) {
      await this.loadTreeData(nextProps.viewUnits);
    }
  }

  render() {
    const { targetKeys, loading } = this.state;

    return (
      <div>
        <Transfer
          targetKeys={targetKeys}
          showSearch={!loading}
          showSelectAll
          className={styles['tree-transfer']}
          titles={[
            null,
            <>
              <span className={styles['header-tip']}>
                {
                  formatMessage({
                    id: 'odc.component.ColumnSelector.TipYouCanClickCustom',
                  }) /* 提示：可点击自定义新建字段 */
                }
              </span>
              <a onClick={this.handleItemAdd}>
                <PlusOutlined />
                {
                  formatMessage({
                    id: 'odc.component.ColumnSelector.Custom',
                  }) /* 自定义 */
                }
              </a>
            </>,
          ]}
          locale={{
            searchPlaceholder: formatMessage({
              id: 'odc.component.ColumnSelector.EnterAFieldName',
            }), // 请输入字段名称
          }}
          onChange={this.handleTransfer}
          onSearch={this.handleTreeSearch}
          oneWay
        >
          {({ direction, selectedKeys, onItemSelectAll }) => {
            if (direction === 'left') {
              this.selectedKeys = selectedKeys;
              return this.renderSourcePanel(onItemSelectAll, selectedKeys);
            }
            if (direction === 'right') {
              return this.renderTargetPanel();
            }
          }}
        </Transfer>
        <Button type="primary" onClick={this.handleSubmit} style={{ marginTop: '20px' }}>
          {
            formatMessage({
              id: 'odc.component.ColumnSelector.Determine',
            }) /* 确定 */
          }
        </Button>
      </div>
    );
  }

  handleSelectAll = (e, onItemSelectAll) => {
    const { checked } = e.target;
    const keys = this.getTreeKeys({
      children: this.state.treeData,
    });

    onItemSelectAll(keys, checked);
  };

  renderSourcePanel = (onItemSelectAll, selectedKeys) => {
    const { targetKeys, treeData, loading, autoExpandParent } = this.state;
    if (loading) {
      return <Spin className={styles.spin} />;
    }
    const allKeys = this.getTreeKeys({ children: treeData });
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
            this.handleSelectAll(e, onItemSelectAll);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.ColumnSelector.AllFields',
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
            this.setState({
              expandedKeys,
              autoExpandParent: false,
            });
          }}
          onCheck={(_, item) => {
            // @ts-ignore
            const { eventKey } = item.node.props;
            const isChecked = selectedKeys.indexOf(eventKey) !== -1;
            const keys = this.getTreeKeys(item.node);
            onItemSelectAll(keys, !isChecked);
          }}
        >
          {this.renderTree(treeData, selectedKeys)}
        </DirectoryTree>
      </>
    );
  };

  renderTargetPanel = () => {
    const { targetKeys, loading } = this.state;
    if (loading || !targetKeys.length) {
      return <Empty style={{ marginTop: '60px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <div style={{ height: '222px', overflow: 'auto' }}>
        {targetKeys.map((targetKey, index) => {
          return (
            <ColumnItem
              key={targetKey}
              // @ts-ignore
              dataKey={targetKey}
              index={index}
              handleChange={this.handleItemChange}
              handleMove={this.handleItemMove}
              handleDelete={this.handleItemDelete}
            />
          );
        })}
      </div>
    );
  };

  renderTree = (treeNodes = [], selectedKeys = []) => {
    const { keywords, targetKeys } = this.state;
    const { session } = this.props;
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
          {this.renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  loadTreeData = async (viewUnits) => {
    const { session } = this.props;
    this.setState({ loading: true });
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
    this.setState({ treeData, loading: false, targetKeys: [] });
  };

  handleSubmit = () => {
    const { targetKeys, selectMap } = this.state;
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
    this.props.onSubmit(columns);
  };

  handleTreeSearch = (_, keywords) => {
    const { treeData } = this.state;
    const { selectedKeys = [] } = this;
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
    this.setState({ keywords, expandedKeys });
  };

  handleTransfer = (nextTargetKeys, direction?, moveKeys?) => {
    const { targetKeys } = this.state;
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

    this.setState({ targetKeys: [...newKeys] });
  };

  handleItemDelete = (idx: number) => {
    const { targetKeys } = this.state;
    if (targetKeys) {
      targetKeys.splice(idx, 1);
      this.handleTransfer(targetKeys, null, null);
    }
  };

  handleItemMove = (dragIndex: number, hoverIndex: number) => {
    const { targetKeys } = this.state;
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

    this.handleTransfer(updateValue, null, null);
  };

  handleItemChange = (data) => {
    const { dataKey } = data;
    const { selectMap } = this.state;
    if (!selectMap[dataKey]) {
      selectMap[dataKey] = { ...data };
    } else {
      selectMap[dataKey] = { ...selectMap[dataKey], ...data };
    }
    this.setState({
      selectMap,
    });
  };

  handleItemAdd = () => {
    const { targetKeys } = this.state;
    this.setState({
      targetKeys: [...targetKeys, uniqueId('odc.customer.column_uid_')],
    });
  };

  getTreeKeys = (root, keys?) => {
    const r = keys || [];
    const { children = [], key } = root;
    if (key) {
      r.push(key);
    }

    if (children.length) {
      children.forEach((child) => {
        this.getTreeKeys(child, r);
      });
    }
    return r;
  };
}
