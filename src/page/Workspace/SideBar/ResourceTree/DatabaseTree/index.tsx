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

import { useContext, useEffect, useMemo } from 'react';
import { DBType, DatabaseGroup } from '@/d.ts/database';
import { DataBaseTreeData } from '../Nodes/database';
import { TreeDataNode } from '../type';
import ResourceTree from '..';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import datasourceStatus from '@/store/datasourceStatus';
import useGroupData from './useGroupData';

const DatabaseTree = function () {
  const { databaseList, reloadDatabaseList, pollingDatabase, groupMode } =
    useContext(ResourceTreeContext);
  const { DatabaseGroupMap } = useGroupData(databaseList);

  async function reloadDatabase() {
    await reloadDatabaseList();
  }

  useEffect(() => {
    reloadDatabase();
  }, []);

  useEffect(() => {
    if (databaseList?.length) {
      const ids: Set<number> = new Set();
      databaseList.forEach((d) => {
        if (d.type !== DBType.LOGICAL) {
          ids.add(d.dataSource?.id);
        }
      });
      datasourceStatus.asyncUpdateStatus(Array.from(ids));
    } else {
    }
  }, [databaseList]);

  /**
   * 全部数据库节点数据，做缓存处理
   */
  const allDatabaseDataNodeMap = useMemo(() => {
    const DatabaseNodeMap = new Map<number, TreeDataNode>();
    const databases = DatabaseGroupMap[DatabaseGroup.none];
    databases?.forEach((db) => {
      DatabaseNodeMap.set(db.id, DataBaseTreeData(undefined, db, db.id, true));
    });
    return DatabaseNodeMap;
  }, [databaseList]);

  return (
    <ResourceTree
      showTip={[DatabaseGroup.none, DatabaseGroup.project].includes(groupMode)}
      stateId={'resourceTree'}
      reloadDatabase={() => reloadDatabase()}
      databaseFrom={'datasource'}
      databases={[...(DatabaseGroupMap[groupMode]?.values() || [])]}
      allDatabasesMap={DatabaseGroupMap[DatabaseGroup.none]}
      pollingDatabase={pollingDatabase}
      DatabaseDataNodeMap={allDatabaseDataNodeMap}
    />
  );
};

export default DatabaseTree;
