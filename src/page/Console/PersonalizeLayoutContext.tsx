import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocalStorageState } from 'ahooks';
import login from '@/store/login';
import { defaultCheckedKeys } from './components/PersonalizeLayoutSetting';
import { TaskTypes, ScheduleTypes } from './const';
import type { TreeDataNode } from 'antd';
import { TaskType } from '@/d.ts';
import { ScheduleType } from '@/d.ts/schedule';

interface PersonalizeLayoutContextType {
  checkedKeys: React.Key[];
  setCheckedKeys: (keys: React.Key[]) => void;
  treeData: TreeDataNode[] | null;
  setTreeData: (data: TreeDataNode[]) => void;
  getOrderedTaskTypes: () => TaskType[];
  getOrderedScheduleTypes: () => ScheduleType[];
}

export const PersonalizeLayoutContext = createContext<PersonalizeLayoutContextType | undefined>(
  undefined,
);

interface PersonalizeLayoutProviderProps {
  children: ReactNode;
}

export const PersonalizeLayoutProvider: React.FC<PersonalizeLayoutProviderProps> = ({
  children,
}) => {
  const [checkedKeys, setCheckedKeys] = useLocalStorageState<React.Key[]>(
    `personalizeLayoutCheckedKeys-${login.organizationId}`,
  );

  const [treeData, setTreeData] = useLocalStorageState<TreeDataNode[]>(
    `personalizeLayoutTreeData-${login.organizationId}`,
  );

  // Helper function to extract ordered types from tree data
  const extractOrderedTypes = <T extends string>(targetTypes: T[], fallbackOrder: T[]): T[] => {
    if (!treeData) return fallbackOrder;

    const extractTypes = (nodes: TreeDataNode[]): T[] => {
      const result: T[] = [];

      for (const node of nodes) {
        // Check if this node is a target type
        if (targetTypes.includes(node.key as T)) {
          result.push(node.key as T);
        }

        // Recursively check children
        if (node.children) {
          result.push(...extractTypes(node.children));
        }
      }

      return result;
    };

    const orderedTypes = extractTypes(treeData);

    // Return ordered types, fallback to default order for any missing types
    return orderedTypes.length > 0 ? orderedTypes : fallbackOrder;
  };

  const getOrderedTaskTypes = useMemo(
    () => () => extractOrderedTypes(TaskTypes, TaskTypes),
    [treeData],
  );

  const getOrderedScheduleTypes = useMemo(
    () => () => extractOrderedTypes(ScheduleTypes, ScheduleTypes),
    [treeData],
  );

  return (
    <PersonalizeLayoutContext.Provider
      value={{
        checkedKeys: checkedKeys || defaultCheckedKeys,
        setCheckedKeys,
        treeData: treeData || null,
        setTreeData,
        getOrderedTaskTypes,
        getOrderedScheduleTypes,
      }}
    >
      {children}
    </PersonalizeLayoutContext.Provider>
  );
};
