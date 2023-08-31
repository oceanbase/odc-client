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

import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { openNewDefaultPLPage, openNewSQLPage, openOBClientPage } from '@/store/helper/page';
import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';
import tracert from '@/util/tracert';
import { getDataSourceModeConfig } from '@/common/datasource';

export const databaseMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.Database]: [
    {
      key: 'NEW_SQL',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheSqlWindow' }), //打开 SQL 窗口
      ],
      ellipsis: true,
      run(session, node, databaseFrom) {
        const database: IDatabase = node.data;
        tracert.click('a3112.b41896.c330992.d367627');
        openNewSQLPage(node.cid, databaseFrom);
      },
    },
    {
      key: 'NEW_PL',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheAnonymousBlockWindow' }), //打开匿名块窗口
      ],
      isHide(_, node) {
        const database: IDatabase = node.data;
        return !getDataSourceModeConfig(database?.dataSource?.type)?.features?.anonymousBlock;
      },
      ellipsis: true,
      run(session, node, databaseFrom) {
        const database: IDatabase = node.data;
        openNewDefaultPLPage(null, node.cid, database?.name, databaseFrom);
      },
    },
    {
      key: 'NEW_OBCLIENT',
      text: [
        formatMessage({ id: 'odc.TreeNodeMenu.config.database.OpenTheCommandLineWindow' }), //打开命令行窗口
      ],
      isHide(_, node) {
        return !login.isPrivateSpace() || !setting.enableOBClient;
      },
      ellipsis: true,
      run(session, node) {
        const database: IDatabase = node.data;
        openOBClientPage(database?.dataSource?.id, database?.id);
      },
    },
  ],
};
