import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { Button, Empty, Spin, Transfer, Tree } from 'antd';
import update from 'immutability-helper';
import { uniqueId } from 'lodash';
import { inject, observer } from 'mobx-react';
import { parse } from 'query-string';
import { PureComponent } from 'react';
import { ICON_DATABASE, ICON_TABLE, ICON_VIEW } from '../ObjectName';
import styles from './index.less';
import TableItem from './Item';

const { TreeNode, DirectoryTree } = Tree;
interface IProps {
  schemaStore?: SchemaStore;
  onSubmit: (values: any) => void;
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

@inject('schemaStore')
@observer
export default class TreeSelector extends PureComponent<IProps, IState> {
  selectedKeys: any[];
  constructor(props) {
    super(props);
    this.selectedKeys = [];
    this.state = {
      targetKeys: [],
      treeData: [],
      expandedKeys: [],
      autoExpandParent: true,
      selectMap: {},
      keywords: '',
      loading: true,
    };
  }

  async componentDidMount() {
    this.loadTreeData(true);
  }

  loadTreeData = async (isInit) => {
    const { schemaStore } = this.props;
    this.setState({ loading: true });
    await schemaStore.queryTablesAndViews('', true);
    const treeData = Object.entries(schemaStore.allTableAndView)?.map(([dbName, obj]) => {
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
    this.setState({
      treeData,
      // 默认展开第 0 项
      expandedKeys: isInit && treeData.length ? [treeData[0].key] : this.state.expandedKeys,
      loading: false,
    });
  };

  render() {
    const { targetKeys, loading } = this.state;

    return (
      <div>
        <Transfer
          showSearch={!loading}
          targetKeys={targetKeys}
          showSelectAll
          className={styles['tree-transfer']}
          locale={{
            searchPlaceholder: formatMessage({
              id: 'odc.component.TableSelector.EnterATableOrView',
            }), // 请输入表/视图名称
          }}
          onChange={this.handleTransfer}
          onSearch={this.handleTreeSearch}
          oneWay
        >
          {({ direction, onItemSelect, selectedKeys }) => {
            if (direction === 'left') {
              this.selectedKeys = selectedKeys;
              return this.renderSourcePanel(onItemSelect, selectedKeys);
            }

            if (direction === 'right') {
              return this.renderTargetPanel();
            }
          }}
        </Transfer>
        <Button type="primary" onClick={this.handleSubmit} style={{ marginTop: '20px' }}>
          {
            formatMessage({
              id: 'odc.component.TableSelector.Determine',
            }) /* 确定 */
          }
        </Button>
      </div>
    );
  }

  renderSourcePanel = (onItemSelect, selectedKeys) => {
    const { targetKeys, treeData, expandedKeys, loading, autoExpandParent } = this.state;
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
          this.setState({
            expandedKeys,
            autoExpandParent: false,
          });
        }}
        onCheck={(_, item) => {
          this.handleTreeNodeSelect(item, selectedKeys, onItemSelect);
        }}
        onSelect={(_, item) => {
          this.handleTreeNodeSelect(item, selectedKeys, onItemSelect);
        }}
      >
        {this.renderTree(treeData, selectedKeys)}
      </DirectoryTree>
    );
  };

  renderTargetPanel = () => {
    const { targetKeys } = this.state;
    if (!targetKeys.length) {
      return <Empty style={{ marginTop: '80px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div style={{ height: '262px', overflow: 'auto' }}>
        {targetKeys.map((targetKey, index) => {
          return (
            <TableItem
              key={targetKey}
              index={index}
              // @ts-ignore
              dataKey={targetKey}
              isLast={index === targetKeys.length - 1}
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
          {this.renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  handleSubmit = () => {
    const { targetKeys, selectMap } = this.state;
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
    this.props.onSubmit({ viewUnits, operations });
  };

  handleTreeNodeSelect = (item, selectedKeys, onItemSelect) => {
    const { eventKey } = item.node.props;
    const isChecked = selectedKeys.indexOf(eventKey) !== -1;
    onItemSelect(eventKey, !isChecked);
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
    // 存在同表多选情况，需要 uid 做唯一标识
    newKeys = newKeys.map((key) =>
      key.indexOf('uid') !== -1 ? key : `${key}&uid=${uniqueId('t_')}`,
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
    this.setState({ selectMap });
  };
}
