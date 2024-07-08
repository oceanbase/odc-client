import { formatMessage } from '@/util/intl';
import { DbObjectType, ConnectType, SynonymType } from '@/d.ts';
import {
  openTableViewPage,
  openPackageViewPage,
  openFunctionViewPage,
  openProcedureViewPage,
  openTriggerViewPage,
  openTypeViewPage,
  openSequenceViewPage,
  openSynonymViewPage,
  openViewViewPage,
} from '@/store/helper/page';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import { TopTab as PackageTopTab } from '@/page/Workspace/components/PackagePage';
import { DbObjectTypeTextMap } from '@/constant/label';

const mysqlObjectType = [
  DbObjectType.table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.procedure,
];

const pgObjectType = [
  DbObjectType.table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.trigger,
];

const oracleObjectType = [
  DbObjectType.table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.procedure,
  DbObjectType.package,
  DbObjectType.trigger,
  DbObjectType.type,
  DbObjectType.sequence,
  DbObjectType.synonym,
];

export const objectTypeConfig = {
  [ConnectType.OB_MYSQL]: mysqlObjectType,
  [ConnectType.MYSQL]: mysqlObjectType,
  [ConnectType.DORIS]: mysqlObjectType,
  [ConnectType.PG]: pgObjectType,
  [ConnectType.OB_ORACLE]: oracleObjectType,
  [ConnectType.ORACLE]: oracleObjectType,
  SEARCH_OBJECT_FROM_ALL_DATABASE: oracleObjectType,
};

export enum SearchTypeMap {
  DATABASE = 'DATABASE',
  OBJECT = 'OBJECT',
}

export const SEARCH_OBJECT_FROM_ALL_DATABASE = 'SEARCH_OBJECT_FROM_ALL_DATABASE';

export const MAX_OBJECT_LENGTH = 200;

export const DbObjectTypeMap = {
  SEARCH_OBJECT_FROM_ALL_DATABASE: {
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.ED30EF41',
      defaultMessage: '全部',
    }),
  },
  [DbObjectType.table]: {
    label: DbObjectTypeTextMap.TABLE,
    openPage: (object) => openTableViewPage,
    getOpenTab: (object, databaseId) => {
      const name = object?.name;
      return [name, TopTab.PROPS, PropsTab.DDL, databaseId];
    },
  },
  [DbObjectType.column]: {
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.35B21489',
      defaultMessage: '列',
    }),
    openPage: (object) => {
      const funcMap = {
        [DbObjectType.view]: openViewViewPage,
        [DbObjectType.table]: openTableViewPage,
      };
      return funcMap[object?.dbObject?.type];
    },
    getOpenTab: (object, databaseId) => {
      return [object?.dbObject?.name, TopTab.PROPS, PropsTab.DDL, databaseId];
    },
  },
  [DbObjectType.view]: {
    label: DbObjectTypeTextMap.VIEW,
    openPage: (object) => openViewViewPage,
    getOpenTab: (object, databaseId) => {
      const databaseName = object?.dbObject?.database?.name || object?.database?.name;
      return [object?.name, TopTab.PROPS, PropsTab.INFO, databaseId, databaseName];
    },
  },
  [DbObjectType.function]: {
    label: DbObjectTypeTextMap.FUNCTION,
    openPage: (object) => openFunctionViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, TopTab.PROPS, PropsTab.INFO, databaseId];
    },
  },
  [DbObjectType.procedure]: {
    label: DbObjectTypeTextMap.PROCEDURE,
    openPage: (object) => openProcedureViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, TopTab.PROPS, PropsTab.INFO, databaseId];
    },
  },
  [DbObjectType.package]: {
    label: DbObjectTypeTextMap.PACKAGE,
    openPage: (object) => openPackageViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, PackageTopTab.HEAD, PropsTab.DDL, databaseId];
    },
  },
  [DbObjectType.trigger]: {
    label: DbObjectTypeTextMap.TRIGGER,
    openPage: (object) => openTriggerViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, undefined, true, undefined, databaseId];
    },
  },
  [DbObjectType.type]: {
    label: DbObjectTypeTextMap.TYPE,
    openPage: (object) => openTypeViewPage,
    getOpenTab: (object, databaseId) => {
      const databaseName = object?.dbObject?.database?.name || object?.database?.name;
      return [object?.name, PropsTab.DDL, databaseId, databaseName];
    },
  },
  [DbObjectType.sequence]: {
    label: DbObjectTypeTextMap.SEQUENCE,
    openPage: (object) => openSequenceViewPage,
    getOpenTab: (object, databaseId) => {
      const databaseName = object?.dbObject?.database?.name || object?.database?.name;
      return [object?.name, PropsTab.DDL, databaseId, databaseName];
    },
  },
  [DbObjectType.synonym]: {
    label: DbObjectTypeTextMap.SYNONYM,
    openPage: (object) => openSynonymViewPage,
    getOpenTab: (object, databaseId) => {
      const databaseName = object?.dbObject?.database?.name || object?.database?.name;
      return [object?.name, SynonymType.COMMON, databaseId, databaseName];
    },
  },
};
