import { formatMessage } from '@/util/intl';
import { PlusOutlined } from '@ant-design/icons';
import MViewContext from '../context/MaterializedViewContext';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { getTableColumnList } from '@/common/network/table';
import { parse } from 'query-string';
import { getMaterializedView } from '@/common/network/materializedView/index';
import { Checkbox, Empty, Spin, Transfer, Tree, message } from 'antd';
import styles from '../index.less';
import SortableContainer, { DraggableItem } from '@/component/SortableContainer';
import { debounce, uniqueId } from 'lodash';
import { MaterializedViewTabType } from '../interface';
import { DataNode } from 'antd/lib/tree';
import { useDataSourceConfig } from '../config';
import ColumnItem from '@/page/Workspace/components/CreateViewPage/component/ColumnSelector/Item';
const { TreeNode, DirectoryTree } = Tree;

const Columns = () => {
  const mviewContext = useContext(MViewContext);
  const { viewUnits, session, setColumns, activetab } = mviewContext;
  const [treeData, setTreeData] = useState<DataNode[]>();
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [keywords, setKeyWords] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const datasourceConfig = useDataSourceConfig(session?.connection?.type);
  const [selectMap, setSelectMap] = useState<{
    [key: string]: {
      aliasName: string;
      dataKey: string;
      columnName?: string;
    };
  }>({});
  const [targetKeyAliasNameMap, setTargetKeyAliasNameMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadTreeData();
  }, [JSON.stringify(viewUnits)]);

  useEffect(() => {
    if (activetab === MaterializedViewTabType.COLUMN && !viewUnits.length) {
      message.warning(
        formatMessage({
          id: 'odc.components.CreateViewPage.SelectABaseTableFirst',
          defaultMessage: '请先选择基表',
        }),
        // 请先选择基表
      );
    }
  }, [JSON.stringify(viewUnits), activetab]);

  useEffect(() => {
    targetKeys.forEach((item) => {
      targetKeyAliasNameMap[item] = selectMap?.[item]?.aliasName;
    });
    setTargetKeyAliasNameMap(targetKeyAliasNameMap);
  }, [JSON.stringify(selectMap), targetKeys]);

  const loadTreeData = async () => {
    setLoading(true);
    const treeData = [];
    const requests = [];
    const nodes = [];
    viewUnits?.forEach((item) => {
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
        requests.push(
          getMaterializedView({
            materializedViewName: viewName,
            sessionId: session.sessionId,
            dbName: session.database.dbName,
          }),
        );
        nodes.push(node);
      }
      root.children.push(node);
    });
    const resList = await Promise.all(requests);
    resList?.forEach((res, i) => {
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
        node.children = res?.columns?.map((col) => {
          return {
            key: `${node.key}&c=${col.name}&dataType=${col.type}`,
            title: col.name,
          };
        });
      }
    });
    setLoading(false);
    setTreeData(treeData);
    setTargetKeys([]);
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

  const renderTree = (treeNodes = [], selectedKeys = []) => {
    return treeNodes.map((item) => {
      const { children, title, type, key, ...props } = item;
      const params = parse(key);
      const { v, t, c, d, dataType } = params;
      const isChecked = selectedKeys.indexOf(key) !== -1;
      const isLeaf = !!c;
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
          checkable
          selectable={!isLeaf}
          dataRef={item}
        >
          {renderTree(children, selectedKeys)}
        </TreeNode>
      );
    });
  };

  const getTreeKeys = (root, keys?) => {
    const r = keys || [];
    const { children = [], key } = root;
    if (key) {
      r.push(key);
    }

    if (children.length) {
      children?.forEach((child) => {
        getTreeKeys(child, r);
      });
    }
    return r;
  };

  const handleItemAdd = () => {
    setTargetKeys([...targetKeys, uniqueId('odc.customer.column_uid_')]);
  };

  const handleTreeSearch = (_, keywords) => {
    const expandedKeys = [];
    if (keywords) {
      treeData.forEach((node) => {
        const { children = [] } = node;
        const isMatch = children.find((item) => {
          const upperKeywords = keywords.toUpperCase();
          const upperItemKey = (item.key as string).toUpperCase();
          return upperItemKey.indexOf(upperKeywords) > -1 || selectedKeys.includes(item.key);
        });
        if (isMatch) {
          expandedKeys.push(node.key);
        }
      });
    }
    setKeyWords(keywords);
    setExpandedKeys(expandedKeys);
  };

  const handleSelectAll = (e, onItemSelectAll) => {
    const { checked } = e.target;
    const keys = getTreeKeys({
      children: treeData,
    });

    onItemSelectAll(keys, checked);
  };

  const handleTransfer = (nextTargetKeys, direction?, moveKeys?) => {
    let newKeys = [];
    if (moveKeys) {
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
    setTargetKeys([...newKeys]);
    handleSubmit([...newKeys]);
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

  const handleSubmit = debounce((Keys) => {
    const columns = [];
    Keys.forEach((key) => {
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
    setColumns(columns);
  }, 100);

  const renderSourcePanel = (onItemSelectAll, selectedKeys) => {
    if (loading) {
      return <Spin className={styles.spin} />;
    }
    const allKeys = getTreeKeys({ children: treeData });
    const selectKeysObject = {};
    selectedKeys?.forEach((key) => {
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
          全部列
        </Checkbox>
        <DirectoryTree
          blockNode
          defaultExpandAll
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
    if (loading || !targetKeys.length) {
      return <Empty style={{ marginTop: '60px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <div style={{ height: '462px', overflow: 'auto' }}>
        <SortableContainer
          list={targetKeys}
          onDrapEnd={(list) => {
            setTargetKeys(list);
          }}
        >
          {targetKeys.map((targetKey) => {
            return (
              <DraggableItem id={targetKey} key={targetKey}>
                <ColumnItem
                  selectMap={selectMap}
                  useCaseInput
                  caseSensitive={datasourceConfig?.sql?.caseSensitivity}
                  escapes={datasourceConfig?.sql?.escapeChar}
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

  return (
    <div style={{ padding: '12px' }}>
      <p>选择列</p>
      <Transfer
        showSelectAll
        showSearch={!loading}
        targetKeys={targetKeys}
        dataSource={dataSource}
        className={styles['mv-tree-column-transfer']}
        titles={[
          null,
          <>
            <span className={styles['header-tip']}>
              提示：可点击自定义新建列，列的别名必须填写且不能重复
            </span>
            <a onClick={handleItemAdd}>
              <PlusOutlined />
              {formatMessage({
                id: 'odc.component.ColumnSelector.Custom',
                defaultMessage: '自定义',
              })}
            </a>
          </>,
        ]}
        locale={{ searchPlaceholder: '请输入列名称' }}
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
    </div>
  );
};

export default Columns;
