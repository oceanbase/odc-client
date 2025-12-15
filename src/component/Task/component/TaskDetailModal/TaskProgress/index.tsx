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

import { TaskDetail, TaskRecordParameters, TaskType } from '@/d.ts';
import { TaskStore } from '@/store/task';
import { UserStore } from '@/store/login';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IDatabase } from '@/d.ts/database';
import MultipAsyncExecute from './MultipAsyncExecute';
import OnlineSchemaChangeExecute from './OnlineSchemaChangeExecute';
import LogicDatabaseChangeExecute from './LogicDatabaseChangeExecute';

interface IProps {
  taskStore?: TaskStore;
  userStore?: UserStore;
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
  onReload: () => void;
}
const TaskProgress: React.FC<IProps> = ({ task, theme, onReload }) => {
  let content = null;
  switch (task?.type) {
    case TaskType.MULTIPLE_ASYNC: {
      content = <MultipAsyncExecute task={task} theme={theme} onReload={onReload} />;
      break;
    }
    case TaskType.ONLINE_SCHEMA_CHANGE: {
      content = <OnlineSchemaChangeExecute task={task} theme={theme} />;
      break;
    }
    case TaskType.LOGICAL_DATABASE_CHANGE: {
      content = <LogicDatabaseChangeExecute task={task} theme={theme} />;
      break;
    }
  }
  return content;
};
export default inject('taskStore', 'userStore')(observer(TaskProgress));
