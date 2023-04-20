import { IDatabase } from '@/d.ts';
import { openCreateTriggerPage, openNewDefaultPLPage, openNewSQLPage } from '@/store/helper/page';
import { ResourceNodeType } from '../../type';
import { IMenuItemConfig } from '../type';

export const databaseMenusConfig: Partial<Record<ResourceNodeType, IMenuItemConfig[]>> = {
  [ResourceNodeType.Database]: [
    {
      key: 'NEW_SQL',
      text: ['新建 SQL 窗口'],
      run(session, node) {
        const database: IDatabase = node.data;
        openNewSQLPage(node.cid, database?.name);
      },
    },
    {
      key: 'NEW_PL',
      text: ['新建匿名块窗口'],
      run(session, node) {
        const database: IDatabase = node.data;
        openNewDefaultPLPage(null, node.cid, database?.name);
      },
    },
    {
      key: 'NEW_OBCLIENT',
      text: ['新建命令行窗口'],
      run(session, node) {
        openCreateTriggerPage(null, session?.sessionId, session?.database?.dbName);
      },
    },
  ],
};
