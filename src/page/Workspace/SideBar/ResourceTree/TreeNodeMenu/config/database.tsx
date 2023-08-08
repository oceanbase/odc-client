import { ConnectionMode } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { openNewDefaultPLPage, openNewSQLPage, openOBClientPage } from '@/store/helper/page';
import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

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
        return database?.dataSource?.dialectType === ConnectionMode.OB_MYSQL;
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
