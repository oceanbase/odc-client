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

import { formatMessage } from '@/util/intl';
export enum ActivityBarItemType {
  Database = 'database',
  Script = 'script',
  Task = 'Task',
  Manager = 'manager',
}
export const ActivityBarItemTypeText = {
  [ActivityBarItemType.Database]: formatMessage({
    id: 'odc.Workspace.ActivityBar.type.Database',
  }),
  //数据库
  [ActivityBarItemType.Task]: formatMessage({
    id: 'odc.src.page.Workspace.ActivityBar.WorkOrder',
  }), //'工单'
  [ActivityBarItemType.Script]: formatMessage({
    id: 'odc.Workspace.ActivityBar.type.Script',
  }),
  //脚本
  [ActivityBarItemType.Manager]: formatMessage({
    id: 'odc.Workspace.ActivityBar.type.OMManagement',
  }), //运维管理
};
