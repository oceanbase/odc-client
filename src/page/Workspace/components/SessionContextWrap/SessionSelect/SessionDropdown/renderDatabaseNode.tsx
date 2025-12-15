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

import { hasPermission } from '@/component/Task/helper';
import { TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import DatabasesTitle from './components/DatabasesTitle';
import { getIcon, NodeType } from './helper';
import styles from './index.less';
import login from '@/store/login';

const renderDatabaseNode = (parmas: {
  taskType: TaskType;
  database: IDatabase;
  canCheckedDbKeys?: number[];
}) => {
  const { taskType, database, canCheckedDbKeys } = parmas;
  let dbDisabled: boolean = false;
  if (taskType) {
    dbDisabled = !hasPermission(taskType, database.authorizedPermissionTypes);
  } else {
    dbDisabled = !database.authorizedPermissionTypes?.length;
  }
  if (login.isPrivateSpace()) {
    dbDisabled = false;
  }
  !dbDisabled && canCheckedDbKeys && canCheckedDbKeys.push(database.id);

  return {
    title: <DatabasesTitle taskType={taskType} db={database} disabled={dbDisabled} />,
    key: database.id,
    selectable: true,
    isLeaf: true,
    icon: (
      <div className={styles.databaseIconContainer}>
        {getIcon({ type: NodeType.Database, database })}
      </div>
    ),
    data: database,
    disabled: dbDisabled,
    type: NodeType.Database,
  };
};
export default renderDatabaseNode;
