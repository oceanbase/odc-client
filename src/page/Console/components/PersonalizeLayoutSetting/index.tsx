import { LayoutOutlined } from '@ant-design/icons';
import { Button, Popover, Typography } from 'antd';
import styles from './index.less';

import React, { useState, useEffect, useContext } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import login from '@/store/login';
import { TaskType } from '@/d.ts';
import { ELayoutKey } from '../../const';
import { PersonalizeLayoutContext } from '@/page/Console/PersonalizeLayoutContext';
import { ScheduleType } from '@/d.ts/schedule';

const { Text } = Typography;

// localStorage key for saving tree state
export const TREE_STATE_KEY = `personalizeLayoutTreeState-${login.organizationId}`;

const treeData: TreeDataNode[] = [
  {
    title: '快速上手',
    key: ELayoutKey.QuickStart,
  },
  {
    title: '任务概览',
    key: ELayoutKey.TaskOverview,
    children: [
      {
        title: '工单',
        key: ELayoutKey.WorkOrder,
        children: [
          { title: '导出', key: TaskType.EXPORT, isLeaf: true },
          { title: '导出结果集', key: TaskType.EXPORT_RESULT_SET },
          { title: '导入', key: TaskType.IMPORT },
          { title: '模拟数据', key: TaskType.DATAMOCK },
          { title: '数据库变更', key: TaskType.ASYNC },
          { title: '多库变更', key: TaskType.MULTIPLE_ASYNC },
          { title: '逻辑库变更', key: TaskType.LOGICAL_DATABASE_CHANGE },
          { title: '影子表同步', key: TaskType.SHADOW },
          { title: '结构比对', key: TaskType.STRUCTURE_COMPARISON },
          { title: '无锁结构变更', key: TaskType.ONLINE_SCHEMA_CHANGE },
        ],
      },
      {
        title: '作业',
        key: ELayoutKey.Job,
        children: [
          { title: '数据归档', key: ScheduleType.DATA_ARCHIVE },
          { title: '数据清理', key: ScheduleType.DATA_DELETE },
          { title: '分区计划', key: ScheduleType.PARTITION_PLAN },
          { title: 'SQL 计划', key: ScheduleType.SQL_PLAN },
        ],
      },
    ],
  },
  {
    title: '最近访问数据库',
    key: ELayoutKey.RecentDatabases,
  },
  {
    title: '关于我们',
    key: ELayoutKey.AboutUs,
  },
  {
    title: '最佳实践',
    key: ELayoutKey.BestPractices,
  },
];

export const showJobDivider = [
  ScheduleType.DATA_ARCHIVE,
  ScheduleType.DATA_DELETE,
  ScheduleType.PARTITION_PLAN,
  ScheduleType.SQL_PLAN,
];

// Default state for reset functionality
export const defaultCheckedKeys = [
  ELayoutKey.QuickStart,
  ELayoutKey.TaskOverview,
  ELayoutKey.RecentDatabases,
  ELayoutKey.AboutUs,
  ELayoutKey.BestPractices,
  TaskType.EXPORT,
  TaskType.EXPORT_RESULT_SET,
  TaskType.IMPORT,
  TaskType.DATAMOCK,
  TaskType.ASYNC,
  TaskType.MULTIPLE_ASYNC,
  TaskType.LOGICAL_DATABASE_CHANGE,
  TaskType.SHADOW,
  TaskType.STRUCTURE_COMPARISON,
  TaskType.ONLINE_SCHEMA_CHANGE,
  TaskType.ALTER_SCHEDULE,

  ScheduleType.DATA_ARCHIVE,
  ScheduleType.DATA_DELETE,
  ScheduleType.PARTITION_PLAN,
  ScheduleType.SQL_PLAN,
];

const defaultExpandedKeys = [ELayoutKey.TaskOverview];

// Interface for saved state
interface SavedTreeState {
  treeData: TreeDataNode[];
  checkedKeys: React.Key[];
  expandedKeys: React.Key[];
}

// Helper function to save state to localStorage
const saveTreeState = (state: SavedTreeState) => {
  try {
    localStorage.setItem(TREE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save tree state to localStorage:', error);
  }
};

// Helper function to load state from localStorage
export const loadTreeState = (): SavedTreeState | null => {
  try {
    const savedState = localStorage.getItem(TREE_STATE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load tree state from localStorage:', error);
  }
  return null;
};

const TreeSetting = () => {
  // Load initial state from localStorage or use defaults
  const savedState = loadTreeState();
  const { checkedKeys, setCheckedKeys } = useContext(PersonalizeLayoutContext);

  const [gData, setGData] = useState<TreeDataNode[]>(savedState?.treeData || treeData);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(
    savedState?.expandedKeys || defaultExpandedKeys,
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave: SavedTreeState = {
      treeData: gData,
      checkedKeys,
      expandedKeys,
    };
    saveTreeState(stateToSave);
  }, [gData, checkedKeys, expandedKeys]);

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    console.log('onExpand', expandedKeysValue);
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue as React.Key[]);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };

  const onDragEnter: TreeProps['onDragEnter'] = (info) => {
    console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]); // the drop position relative to the drop node, inside 0, top -1, bottom 1

    const loop = (
      data: TreeDataNode[],
      key: React.Key,
      callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void,
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };
    const data = [...gData];

    // Find dragObject
    let dragObj: TreeDataNode;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert. New item was inserted to the start of the array in this example, but can be anywhere
        item.children.unshift(dragObj);
      });
    } else {
      let ar: TreeDataNode[] = [];
      let i: number;
      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i!, 0, dragObj!);
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i! + 1, 0, dragObj!);
      }
    }
    setGData(data);
  };

  const isDraggable = (node: TreeDataNode) => {
    // Only allow "工单" and "作业" children to be dragged
    const key = node.key as TaskType;
    return [
      TaskType.EXPORT,
      TaskType.EXPORT_RESULT_SET,
      TaskType.IMPORT,
      TaskType.DATAMOCK,
      TaskType.ASYNC,
      TaskType.MULTIPLE_ASYNC,
      TaskType.LOGICAL_DATABASE_CHANGE,
      TaskType.SHADOW,
      TaskType.STRUCTURE_COMPARISON,
      TaskType.ONLINE_SCHEMA_CHANGE,
      ScheduleType.DATA_ARCHIVE,
      ScheduleType.DATA_DELETE,
      ScheduleType.PARTITION_PLAN,
      ScheduleType.SQL_PLAN,
      TaskType.ALTER_SCHEDULE,
    ].includes(key);
  };

  const handleReset = () => {
    // Clear localStorage and reset to default state
    try {
      localStorage.removeItem(TREE_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }

    setGData(treeData);
    setExpandedKeys(defaultExpandedKeys);
    setCheckedKeys(defaultCheckedKeys);
    setAutoExpandParent(true);
  };

  return (
    <div className={styles.customLayoutPanel}>
      <div className={styles.panelHeader}>
        <Text className={styles.panelTitle}>自定义布局</Text>
        <Button type="link" size="small" onClick={handleReset}>
          重置
        </Button>
      </div>
      <div className={styles.panelContent}>
        <Tree
          className="draggable-tree"
          checkable
          blockNode
          draggable={(node) => isDraggable(node)}
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          onSelect={onSelect}
          selectedKeys={selectedKeys}
          onDragEnter={onDragEnter}
          onDrop={onDrop}
          treeData={gData}
        />
      </div>
    </div>
  );
};

const PersonalizeLayoutSetting = () => {
  return (
    <Popover
      content={<TreeSetting />}
      placement="bottomLeft"
      trigger="click"
      classNames={{ root: styles.customLayoutPopover }}
    >
      <Button className={styles.personalizeLayoutSetting}>
        <LayoutOutlined />
      </Button>
    </Popover>
  );
};
export default PersonalizeLayoutSetting;
