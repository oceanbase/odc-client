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

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocalStorageState } from 'ahooks';
import login from '@/store/login';
import { defaultCheckedKeys } from './components/PersonalizeLayoutSetting';
import { TaskTypes, ScheduleTypes } from './const';
import type { TreeDataNode } from 'antd';
import { TaskType } from '@/d.ts';
import { ScheduleType } from '@/d.ts/schedule';

/**
 * Personalize layout context type
 */
interface PersonalizeLayoutContextType {
  /** Checked keys in the layout tree */
  checkedKeys: React.Key[];
  /** Update checked keys */
  setCheckedKeys: (keys: React.Key[]) => void;
  /** Tree data structure */
  treeData: TreeDataNode[] | null;
  /** Update tree data */
  setTreeData: (data: TreeDataNode[]) => void;
  /** Get ordered task types based on user's drag configuration */
  getOrderedTaskTypes: () => TaskType[];
  /** Get ordered schedule types based on user's drag configuration */
  getOrderedScheduleTypes: () => ScheduleType[];
}

/**
 * Context for personalized console layout
 */
export const PersonalizeLayoutContext = createContext<PersonalizeLayoutContextType | undefined>(
  undefined,
);

/**
 * Personalize layout provider props
 */
interface PersonalizeLayoutProviderProps {
  children: ReactNode;
}

/**
 * Provider component for personalized console layout
 * Manages user's layout preferences and stores them in localStorage
 */
export const PersonalizeLayoutProvider: React.FC<PersonalizeLayoutProviderProps> = ({
  children,
}) => {
  const [checkedKeys, setCheckedKeys] = useLocalStorageState<React.Key[]>(
    `personalizeLayoutCheckedKeys-${login.user?.id}`,
  );

  const [treeData, setTreeData] = useLocalStorageState<TreeDataNode[]>(
    `personalizeLayoutTreeData-${login.user?.id}`,
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
