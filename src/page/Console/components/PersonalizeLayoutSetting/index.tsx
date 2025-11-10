import { formatMessage } from '@/util/intl';
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
import { sortByPreservedOrder } from '@/util/utils';

const { Text } = Typography;

// localStorage key for saving tree state
export const TREE_STATE_KEY = `personalizeLayoutTreeState-${login.user?.id}`;

const getTreeData = () => [
  {
    title: formatMessage({
      id: 'src.page.Console.components.PersonalizeLayoutSetting.60616B68',
      defaultMessage: '快速上手',
    }),
    key: ELayoutKey.QuickStart,
  },
  {
    title: formatMessage({
      id: 'src.page.Console.components.PersonalizeLayoutSetting.9AADF50D',
      defaultMessage: '任务概览',
    }),
    key: ELayoutKey.TaskOverview,
    children: [
      {
        title: formatMessage({
          id: 'src.page.Console.components.PersonalizeLayoutSetting.C6D4B325',
          defaultMessage: '工单',
        }),
        key: ELayoutKey.WorkOrder,
        children: [
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.8F2D74D1',
              defaultMessage: '导出',
            }),
            key: TaskType.EXPORT,
            isLeaf: true,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.521CB40A',
              defaultMessage: '导出结果集',
            }),
            key: TaskType.EXPORT_RESULT_SET,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.24132129',
              defaultMessage: '导入',
            }),
            key: TaskType.IMPORT,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.AADB81A4',
              defaultMessage: '模拟数据',
            }),
            key: TaskType.DATAMOCK,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.5861A687',
              defaultMessage: '数据库变更',
            }),
            key: TaskType.ASYNC,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.88174759',
              defaultMessage: '多库变更',
            }),
            key: TaskType.MULTIPLE_ASYNC,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.88E2DD8F',
              defaultMessage: '逻辑库变更',
            }),
            key: TaskType.LOGICAL_DATABASE_CHANGE,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.A32BDC1A',
              defaultMessage: '影子表同步',
            }),
            key: TaskType.SHADOW,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.F41B6349',
              defaultMessage: '结构比对',
            }),
            key: TaskType.STRUCTURE_COMPARISON,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.1FD0E67C',
              defaultMessage: '无锁结构变更',
            }),
            key: TaskType.ONLINE_SCHEMA_CHANGE,
          },
        ],
      },
      {
        title: formatMessage({
          id: 'src.page.Console.components.PersonalizeLayoutSetting.8D88CF81',
          defaultMessage: '作业',
        }),
        key: ELayoutKey.Job,
        children: [
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.DB69DC53',
              defaultMessage: '数据归档',
            }),
            key: ScheduleType.DATA_ARCHIVE,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.930263C1',
              defaultMessage: '数据清理',
            }),
            key: ScheduleType.DATA_DELETE,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.520268CF',
              defaultMessage: '分区计划',
            }),
            key: ScheduleType.PARTITION_PLAN,
          },
          {
            title: formatMessage({
              id: 'src.page.Console.components.PersonalizeLayoutSetting.BF17D26F',
              defaultMessage: 'SQL 计划',
            }),
            key: ScheduleType.SQL_PLAN,
          },
        ],
      },
    ],
  },
  {
    title: formatMessage({
      id: 'src.page.Console.components.PersonalizeLayoutSetting.D73F5C22',
      defaultMessage: '最近访问数据库',
    }),
    key: ELayoutKey.RecentDatabases,
  },
  {
    title: formatMessage({
      id: 'src.page.Console.components.PersonalizeLayoutSetting.1D0C4D8D',
      defaultMessage: '关于我们',
    }),
    key: ELayoutKey.AboutUs,
  },
  {
    title: formatMessage({
      id: 'src.page.Console.components.PersonalizeLayoutSetting.1CD4C62D',
      defaultMessage: '最佳实践',
    }),
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

/**
 * Interface for saved tree state
 * Only saves draggable items order to localStorage
 */
interface SavedTreeState {
  /** Order of work order children */
  workOrderKeys?: React.Key[];
  /** Order of job children */
  jobKeys?: React.Key[];
  checkedKeys: React.Key[];
  expandedKeys: React.Key[];
}

/**
 * Extract work order and job keys from tree data
 * @param treeData - Tree data structure
 * @returns Object containing workOrderKeys and jobKeys arrays
 */
const extractDraggableOrder = (
  treeData: TreeDataNode[],
): { workOrderKeys: React.Key[]; jobKeys: React.Key[] } => {
  const taskOverview = treeData.find((node) => node.key === ELayoutKey.TaskOverview);
  if (!taskOverview?.children) {
    return { workOrderKeys: [], jobKeys: [] };
  }

  const workOrderNode = taskOverview.children.find((node) => node.key === ELayoutKey.WorkOrder);
  const jobNode = taskOverview.children.find((node) => node.key === ELayoutKey.Job);

  return {
    workOrderKeys: workOrderNode?.children?.map((child) => child.key) || [],
    jobKeys: jobNode?.children?.map((child) => child.key) || [],
  };
};

/**
 * Apply saved order to tree data
 * @param treeData - Original tree data
 * @param savedState - Saved tree state from localStorage
 * @returns Tree data with applied saved order
 */
const applySavedOrder = (
  treeData: TreeDataNode[],
  savedState: SavedTreeState | null,
): TreeDataNode[] => {
  if (!savedState?.workOrderKeys && !savedState?.jobKeys) {
    return treeData;
  }

  return treeData.map((node) => {
    if (node.key !== ELayoutKey.TaskOverview || !node.children) {
      return node;
    }

    return {
      ...node,
      children: node.children.map((child) => {
        // Reorder WorkOrder children using utility function
        if (child.key === ELayoutKey.WorkOrder && savedState.workOrderKeys && child.children) {
          return {
            ...child,
            children: sortByPreservedOrder(child.children, savedState.workOrderKeys),
          };
        }

        // Reorder Job children using utility function
        if (child.key === ELayoutKey.Job && savedState.jobKeys && child.children) {
          return {
            ...child,
            children: sortByPreservedOrder(child.children, savedState.jobKeys),
          };
        }

        return child;
      }),
    };
  });
};

/**
 * Save tree state to localStorage
 * @param state - Tree state to save
 */
const saveTreeState = (state: SavedTreeState) => {
  try {
    localStorage.setItem(TREE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save tree state to localStorage:', error);
  }
};

/**
 * Load tree state from localStorage
 * @returns Saved tree state or null if not found
 */
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

/**
 * Tree setting component for customizing console layout
 * Allows users to drag and reorder items and check/uncheck sections
 */
const TreeSetting = () => {
  const { checkedKeys, setCheckedKeys, setTreeData } = useContext(PersonalizeLayoutContext);

  // Load saved state once and share between states
  const savedStateRef = React.useRef<SavedTreeState | null>(null);
  if (!savedStateRef.current) {
    savedStateRef.current = loadTreeState();
  }

  // Initialize gData only once on mount using function initialization
  // Always use fresh tree data to ensure correct locale
  const [gData, setGData] = useState<TreeDataNode[]>(() => {
    const freshTreeData = getTreeData();
    return applySavedOrder(freshTreeData, savedStateRef.current);
  });

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(() => {
    return savedStateRef?.current?.expandedKeys || defaultExpandedKeys;
  });
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const { workOrderKeys, jobKeys } = extractDraggableOrder(gData);
    const stateToSave: SavedTreeState = {
      workOrderKeys, // Only save work order children order
      jobKeys, // Only save job children order
      checkedKeys,
      expandedKeys,
    };
    saveTreeState(stateToSave);
    setTreeData(gData);
  }, [gData, checkedKeys, expandedKeys]);

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    setCheckedKeys(checkedKeysValue as React.Key[]);
  };

  const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
    setSelectedKeys(selectedKeysValue);
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

  /**
   * Check if a tree node is draggable
   * @param node - Tree node to check
   * @returns True if node is draggable
   */
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

  /**
   * Reset layout to default configuration
   */
  const handleReset = () => {
    // Clear localStorage and reset to default state
    try {
      localStorage.removeItem(TREE_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }

    setGData(getTreeData());
    setExpandedKeys(defaultExpandedKeys);
    setCheckedKeys(defaultCheckedKeys);
    setAutoExpandParent(true);
    // Also reset context treeData
    setTreeData(getTreeData());
  };

  return (
    <div className={styles.customLayoutPanel}>
      <div className={styles.panelHeader}>
        <Text className={styles.panelTitle}>
          {formatMessage({
            id: 'src.page.Console.components.PersonalizeLayoutSetting.2D22CA01',
            defaultMessage: '自定义布局',
          })}
        </Text>
        <Button type="link" size="small" onClick={handleReset}>
          {formatMessage({
            id: 'src.page.Console.components.PersonalizeLayoutSetting.4D6E13D1',
            defaultMessage: '重置',
          })}
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
          onDrop={onDrop}
          treeData={gData}
        />
      </div>
    </div>
  );
};

/**
 * Personalize layout setting component
 * Provides a popover with tree setting interface for customizing console layout
 */
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
