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
  openExternalTableTableViewPage,
  openMaterializedViewViewPage,
} from '@/store/helper/page';
import { PropsTab, TopTab } from '@/page/Workspace/components/TablePage';
import { TopTab as PackageTopTab } from '@/page/Workspace/components/PackagePage';
import { DbObjectTypeTextMap } from '@/constant/label';

const mysqlObjectType = [
  DbObjectType.database,
  DbObjectType.table,
  DbObjectType.external_table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.procedure,
  DbObjectType.materialized_view,
];

const pgObjectType = [
  DbObjectType.table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.trigger,
];

const oracleObjectType = [
  DbObjectType.database,
  DbObjectType.table,
  DbObjectType.external_table,
  DbObjectType.column,
  DbObjectType.function,
  DbObjectType.view,
  DbObjectType.procedure,
  DbObjectType.package,
  DbObjectType.trigger,
  DbObjectType.type,
  DbObjectType.sequence,
  DbObjectType.synonym,
  DbObjectType.materialized_view,
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

export const SEARCH_OBJECT_FROM_ALL_DATABASE = 'SEARCH_OBJECT_FROM_ALL_DATABASE';

export const MAX_OBJECT_LENGTH = 200;

export const DbObjectTypeMap = {
  SEARCH_OBJECT_FROM_ALL_DATABASE: {
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.ED30EF41',
      defaultMessage: '全部',
    }),
  },
  [DbObjectType.database]: {
    label: DbObjectTypeTextMap.DATABASE,
  },
  [DbObjectType.table]: {
    label: DbObjectTypeTextMap.TABLE,
    openPage: (object) => openTableViewPage,
    getOpenTab: (object, databaseId) => {
      const name = object?.name;
      return [name, TopTab.PROPS, PropsTab.DDL, databaseId];
    },
  },
  [DbObjectType.logical_table]: {
    label: DbObjectTypeTextMap.TABLE,
    openPage: (object) => openTableViewPage,
    getOpenTab: (object, databaseId) => {
      return [object.name, TopTab.PROPS, PropsTab.DDL, object?.database?.id, object?.id];
    },
  },
  [DbObjectType.external_table]: {
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearchModal.EABF882B',
      defaultMessage: '外表',
    }),
    openPage: (object) => openExternalTableTableViewPage,
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
        [DbObjectType.external_table]: openExternalTableTableViewPage,
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
      return [object?.name, TopTab.PROPS, PropsTab.DDL, databaseId, databaseName];
    },
  },
  [DbObjectType.function]: {
    label: DbObjectTypeTextMap.FUNCTION,
    openPage: (object) => openFunctionViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, TopTab.PROPS, PropsTab.DDL, databaseId];
    },
  },
  [DbObjectType.procedure]: {
    label: DbObjectTypeTextMap.PROCEDURE,
    openPage: (object) => openProcedureViewPage,
    getOpenTab: (object, databaseId) => {
      return [object?.name, TopTab.PROPS, PropsTab.DDL, databaseId];
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
  [DbObjectType.materialized_view]: {
    label: DbObjectTypeTextMap.MATERIALIZED_VIEW,
    openPage: (object) => openMaterializedViewViewPage,
    getOpenTab: (object, databaseId) => {
      const databaseName = object?.dbObject?.database?.name || object?.database?.name;
      return [object?.name, TopTab.PROPS, PropsTab.DDL, databaseId, databaseName];
    },
  },
};

export enum SearchStatus {
  /** 默认 */
  defalut = 'defalut',

  /** 搜索数据库 */
  forDatabase = 'forDatabase',
  /**搜索数据源 */
  forDataSource = 'forDataSource',
  /** 搜索项目 */
  forProject = 'forProject',

  /** 数据库下搜索对象 */
  databaseforObject = 'databaseforObject',
  /** 项目下搜索对象 */
  projectforObject = 'projectforObject',
  /** 数据源下搜索对象 */
  dataSourceforObject = 'dataSourceforObject',

  /** 数据源&&数据库 下搜索 */
  dataSourceWithDatabaseforObject = 'dataSourceWithDatabaseforObject',
  /** 项目&&数据库 下搜索 */
  projectWithDatabaseforObject = 'projectWithDatabaseforObject',
}

export const SearchOptionTypeTextMap = {
  [SearchStatus.forDatabase]: formatMessage({
    id: 'odc.src.d.ts.Database',
    defaultMessage: '数据库',
  }),
  [SearchStatus.forProject]: formatMessage({
    id: 'odc.SpaceContainer.Sider.Project',
    defaultMessage: '项目',
  }) /*项目*/,
  [SearchStatus.forDataSource]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }),
};

/** 个人空间支持的搜索类型 */
export const privateSpaceSupportSearchOptionList = [
  SearchStatus.forDatabase,
  SearchStatus.forDataSource,
];
export const publicSpaceSupportSearchOptionList = [
  SearchStatus.forDatabase,
  SearchStatus.forProject,
  SearchStatus.forDataSource,
];
