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
import { RefreshMethod } from '@/d.ts';
import { refreshMethodText } from '@/constant/label';

// 物化视图的刷新方式对应允许的同步方式
export const refreshMethodAllowsSyncMethods = {
  [RefreshMethod.REFRESH_FAST]: [
    RefreshMethod.REFRESH_FAST,
    RefreshMethod.REFRESH_COMPLETE,
    RefreshMethod.REFRESH_FORCE,
  ],

  [RefreshMethod.REFRESH_FORCE]: [RefreshMethod.REFRESH_COMPLETE, RefreshMethod.REFRESH_FORCE],
  [RefreshMethod.REFRESH_COMPLETE]: [RefreshMethod.REFRESH_COMPLETE, RefreshMethod.REFRESH_FORCE],
  [RefreshMethod.NEVER_REFRESH]: [],
};

export const synchronizeText = {
  [RefreshMethod.REFRESH_FAST]: {
    tip: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.16B4836C',
      defaultMessage: '仅同步增量数据',
    }),
    descriptions: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.5C86F600',
      defaultMessage: '快速同步仅同步增量数据，且同步过程需要一定的等待时间。',
    }),
    label: refreshMethodText[RefreshMethod.REFRESH_FAST],
  },
  [RefreshMethod.REFRESH_FORCE]: {
    tip: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.CF257DC9',
      defaultMessage: '优先尝试同步增量数据，失败后再尝试同步全量数据',
    }),
    label: refreshMethodText[RefreshMethod.REFRESH_FORCE],
    descriptions: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.BB1C61A1',
      defaultMessage:
        '强制同步优先尝试同步增量数据、失败后再尝试同步全量数据，且同步过程需要一定的等待时间。',
    }),
  },
  [RefreshMethod.REFRESH_COMPLETE]: {
    tip: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.4C303F40',
      defaultMessage: '仅同步全量数据',
    }),
    label: refreshMethodText[RefreshMethod.REFRESH_COMPLETE],
    descriptions: formatMessage({
      id: 'src.page.Workspace.components.DDLResultSet.Sync.87911968',
      defaultMessage: '完全同步仅同步全量数据，且同步过程需要一定的等待时间。',
    }),
  },
};
