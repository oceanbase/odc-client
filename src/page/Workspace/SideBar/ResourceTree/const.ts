import { ResourceNodeType } from './type';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { DbObjectType, PageType, IPage, SynonymType } from '@/d.ts';
import { getMapIdByDB } from './helper';
import { isString } from 'lodash';
import modalStore from '@/store/modal';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { TreeDataNode } from '@/page/Workspace/SideBar/ResourceTree/type';
import React, { useContext, useEffect } from 'react';

const isGroupNode = (type) => {
  return [
    ResourceNodeType.GroupNodeProject,
    ResourceNodeType.GroupNodeCluster,
    ResourceNodeType.GroupNodeConnectType,
    ResourceNodeType.GroupNodeEnviponment,
    ResourceNodeType.GroupNodeTenant,
    ResourceNodeType.GroupNodeDataSource,
    ResourceNodeType.SecondGroupNodeDataSource,
  ].includes(type);
};

const GroupNodeToResourceNodeType = {
  [DatabaseGroup.project]: ResourceNodeType.GroupNodeProject,
  [DatabaseGroup.dataSource]: ResourceNodeType.GroupNodeDataSource,
  [DatabaseGroup.tenant]: ResourceNodeType.GroupNodeTenant,
  [DatabaseGroup.cluster]: ResourceNodeType.GroupNodeCluster,
  [DatabaseGroup.environment]: ResourceNodeType.GroupNodeEnviponment,
  [DatabaseGroup.connectType]: ResourceNodeType.GroupNodeConnectType,
};

const TreeDataGroupKey = 'Group';
const TreeDataSecondGroupKey = 'SecondGroup';
const getGroupKey = (mapId: React.Key, groupMode: DatabaseGroup) =>
  `${TreeDataGroupKey}-${groupMode}-${mapId}`;
const getSecondGroupKey = (mapId: React.Key, secondMapId: number, groupMode: DatabaseGroup) =>
  `${TreeDataSecondGroupKey}-${groupMode}-${mapId}-${secondMapId}`;

/**
 * 获取应该展开的groupkey
 */
const getShouldExpandedGroupKeys = (params: {
  key: React.Key;
  type: ResourceNodeType;
  groupMode?: DatabaseGroup;
  databaseList: IDatabase[];
}) => {
  const { key, type, groupMode, databaseList } = params;
  if (groupMode === DatabaseGroup.none) return [];
  let shouldExpandedKeys: React.Key[] = [];
  let dbId: number;
  switch (type) {
    case ResourceNodeType.GroupNodeProject:
    case ResourceNodeType.GroupNodeCluster:
    case ResourceNodeType.GroupNodeConnectType:
    case ResourceNodeType.GroupNodeEnviponment:
    case ResourceNodeType.GroupNodeTenant:
    case ResourceNodeType.GroupNodeDataSource:
    case ResourceNodeType.SecondGroupNodeDataSource: {
      return [];
    }
    case ResourceNodeType.Database: {
      dbId = key as number;
      break;
    }
    default: {
      if (isString(key)) {
        dbId = Number((key as string).split('-')[0]);
      }
      break;
    }
  }
  const db = databaseList.find((item) => item.id === dbId);
  if (!db) return [];
  const { mapId } = getMapIdByDB(db, groupMode);
  const { mapId: secondMapId } = getMapIdByDB(db, DatabaseGroup.dataSource);
  shouldExpandedKeys.push(
    getGroupKey(mapId, groupMode),
    getSecondGroupKey(mapId, secondMapId, groupMode),
  );
  if ([DatabaseGroup.project, DatabaseGroup.dataSource].includes(groupMode)) {
    shouldExpandedKeys = shouldExpandedKeys.filter((item) => {
      if (isString(item)) {
        return !item.includes(TreeDataSecondGroupKey);
      }
      return true;
    });
  }
  return shouldExpandedKeys;
};

/**
 * 根据对象信息，返回资源树应该展开的key
 * 函数、存储过程定位到具体对象的上一级（兼容存在同名的脏数据、资源树的key值加了index，无法定位到具体对象），其他类型定位到具体对象
 */
const getShouldExpandedKeysByObject = (params: {
  type: DbObjectType;
  database: IDatabase;
  groupMode: DatabaseGroup;
  objectName?: string;
  name?: string;
}) => {
  const { database: db, type, groupMode, objectName, name } = params;
  let shouldExpandedKeys: React.Key[] = [];
  let currentKey: React.Key;
  let currentResourceNodeType: ResourceNodeType;
  if (groupMode !== DatabaseGroup.none && db) {
    const { mapId } = getMapIdByDB(db, groupMode);
    const { mapId: secondMapId } = getMapIdByDB(db, DatabaseGroup.dataSource);
    shouldExpandedKeys.push(
      getGroupKey(mapId, groupMode),
      getSecondGroupKey(mapId, secondMapId, groupMode),
    );
  }
  switch (type) {
    case DbObjectType.database: {
      currentKey = db.id;
      currentResourceNodeType = ResourceNodeType.Database;
      break;
    }
    case DbObjectType.table: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-table`);
      currentKey = `${db.id}-${db.name}-table-${name}`;
      currentResourceNodeType = ResourceNodeType.Table;
      break;
    }
    case DbObjectType.materialized_view: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-materializedView`);
      currentKey = `${db.id}-${db.name}-materializedView-${name}`;
      currentResourceNodeType = ResourceNodeType.MaterializedView;
      break;
    }
    case DbObjectType.external_table: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-externalTable`);
      currentKey = `${db.id}-${db.name}-externalTable-${name}`;
      currentResourceNodeType = ResourceNodeType.ExternalTable;
      break;
    }
    case DbObjectType.column: {
      shouldExpandedKeys.push(
        db.id,
        `${db.id}-${db.name}-table`,
        `${db.id}-${db.name}-table-${objectName}`,
        `${db.id}-${db.name}-table-${objectName}-column`,
      );
      currentKey = `${db.id}-${db.name}-table-${objectName}-column-${name}`;
      currentResourceNodeType = ResourceNodeType.TableColumn;
      break;
    }
    case DbObjectType.function: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-function-pkg`;
      currentResourceNodeType = ResourceNodeType.FunctionRoot;
      break;
    }
    case DbObjectType.view: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-view`);
      currentKey = `${db.id}-${db.name}-view-${name}`;
      currentResourceNodeType = ResourceNodeType.View;
      break;
    }
    case DbObjectType.procedure: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-procedure`;
      currentResourceNodeType = ResourceNodeType.ProcedureRoot;
      break;
    }
    case DbObjectType.package: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-package`);
      currentKey = `${db.id}-${db.name}-package-${name}`;
      currentResourceNodeType = ResourceNodeType.Package;
      break;
    }
    case DbObjectType.trigger: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-trigger`);
      currentKey = `${db.id}-${db.name}-trigger-${name}`;
      currentResourceNodeType = ResourceNodeType.Trigger;
      break;
    }
    case DbObjectType.type: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-type`);
      currentKey = `${db.id}-${db.name}-type-${name}`;
      currentResourceNodeType = ResourceNodeType.Type;
      break;
    }
    case DbObjectType.sequence: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-sequence`);
      currentKey = `${db.id}-${db.name}-sequence-${name}`;
      currentResourceNodeType = ResourceNodeType.Sequence;
      break;
    }
    case DbObjectType.synonym: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-synonym-false`);
      currentKey = `${db.id}-${db.name}-synonym-false-${name}`;
      currentResourceNodeType = ResourceNodeType.Synonym;
      break;
    }
  }
  if ([DatabaseGroup.project, DatabaseGroup.dataSource].includes(groupMode)) {
    shouldExpandedKeys = shouldExpandedKeys.filter((item) => {
      if (isString(item)) {
        return !item?.includes(TreeDataSecondGroupKey);
      }
      return true;
    });
  }
  return {
    shouldExpandedKeys,
    currentKey,
    currentResourceNodeType,
  };
};

/** 根据page信息定位至数据源 */
const getDataSourceShouldExpandedKeysByPage = (params: { datasourceId: number }) => {
  const { datasourceId } = params;
  let shouldExpandedKeys: React.Key[] = [];
  let currentKey: React.Key;
  let currentResourceNodeType: ResourceNodeType;
  // 此时这里只需要定位，不需要展开,赋值undefined 使 shouldExpandedKeys.length 不为0 触发定位即可
  shouldExpandedKeys.push(undefined);
  currentKey = getGroupKey(datasourceId, DatabaseGroup.dataSource);
  currentResourceNodeType = ResourceNodeType.GroupNodeDataSource;
  return {
    shouldExpandedKeys,
    currentKey,
    currentResourceNodeType,
  };
};

const getObjectShouldExpandedKeysByPage = (params: {
  page: IPage;
  db: IDatabase;
  groupMode: DatabaseGroup;
}) => {
  const { page, db, groupMode } = params;
  let shouldExpandedKeys: React.Key[] = [];
  let currentKey: React.Key;
  let currentResourceNodeType: ResourceNodeType;
  if (groupMode !== DatabaseGroup.none && db) {
    const { mapId } = getMapIdByDB(db, groupMode);
    const { mapId: secondMapId } = getMapIdByDB(db, DatabaseGroup.dataSource);
    shouldExpandedKeys.push(
      getGroupKey(mapId, groupMode),
      getSecondGroupKey(mapId, secondMapId, groupMode),
    );
  }
  switch (page.type) {
    case PageType.SQL:
    case PageType.PL: {
      if (groupMode === DatabaseGroup.none) {
        // 此时这里只需要定位，不需要展开,赋值undefined 使 shouldExpandedKeys.length 不为0 触发定位即可
        shouldExpandedKeys.push(undefined);
      }
      currentKey = db.id;
      currentResourceNodeType = ResourceNodeType.Database;
      break;
    }
    case PageType.CREATE_TABLE: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-table`;
      currentResourceNodeType = ResourceNodeType.TableRoot;
      break;
    }
    case PageType.TABLE: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-table`);
      currentKey = `${db.id}-${db.name}-table-${page?.params?.tableName}`;
      currentResourceNodeType = ResourceNodeType.Table;
      break;
    }
    case PageType.VIEW: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-view`);
      currentKey = `${db.id}-${db.name}-view-${page?.params?.viewName}`;
      currentResourceNodeType = ResourceNodeType.View;
      break;
    }
    case PageType.CREATE_VIEW: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-view`;
      currentResourceNodeType = ResourceNodeType.ViewRoot;
      break;
    }
    case PageType.FUNCTION:
    case PageType.BATCH_COMPILE_FUNCTION:
    case PageType.CREATE_FUNCTION: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-function-pkg`;
      currentResourceNodeType = ResourceNodeType.FunctionRoot;
      break;
    }
    case PageType.PROCEDURE:
    case PageType.BATCH_COMPILE_PROCEDURE:
    case PageType.CREATE_PROCEDURE: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-procedure`;
      currentResourceNodeType = ResourceNodeType.ProcedureRoot;
      break;
    }
    case PageType.CREATE_MATERIALIZED_VIEW: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-materializedView`;
      currentResourceNodeType = ResourceNodeType.MaterializedViewRoot;
      break;
    }
    case PageType.MATERIALIZED_VIEW: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-materializedView`);
      currentKey = `${db.id}-${db.name}-materializedView-${page?.params?.materializedViewName}`;
      currentResourceNodeType = ResourceNodeType.MaterializedView;
      break;
    }
    case PageType.EXTERNAL_RESOURCE: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-externalResource`);
      currentKey = `${db.id}-${db.name}-externalResource-${page?.params?.resourceName}`;
      currentResourceNodeType = ResourceNodeType.ExternalResource;
      break;
    }
    case PageType.SEQUENCE: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-sequence`);
      currentKey = `${db.id}-${db.name}-sequence-${page?.params?.sequenceName}`;
      currentResourceNodeType = ResourceNodeType.Sequence;
      break;
    }
    case PageType.CREATE_SEQUENCE: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-sequence`;
      currentResourceNodeType = ResourceNodeType.SequenceRoot;
      break;
    }
    case PageType.PACKAGE: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-package`);
      currentKey = `${db.id}-${db.name}-package-${page?.params?.packageName}`;
      currentResourceNodeType = ResourceNodeType.Package;
      break;
    }
    case PageType.CREATE_PACKAGE:
    case PageType.BATCH_COMPILE_PACKAGE: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-package`;
      currentResourceNodeType = ResourceNodeType.PackageRoot;
      break;
    }
    case PageType.TRIGGER: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-trigger`);
      currentKey = `${db.id}-${db.name}-trigger-${page?.params?.triggerName}`;
      currentResourceNodeType = ResourceNodeType.Trigger;
      break;
    }
    case PageType.CREATE_TRIGGER:
    case PageType.BATCH_COMPILE_TRIGGER:
    case PageType.CREATE_TRIGGER_SQL: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-trigger`;
      currentResourceNodeType = ResourceNodeType.TriggerRoot;
      break;
    }
    case PageType.TYPE: {
      shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-type`);
      currentKey = `${db.id}-${db.name}-type-${page?.params?.typeName}`;
      currentResourceNodeType = ResourceNodeType.Type;
      break;
    }
    case PageType.CREATE_TYPE:
    case PageType.BATCH_COMPILE_TYPE: {
      shouldExpandedKeys.push(db.id);
      currentKey = `${db.id}-${db.name}-type`;
      currentResourceNodeType = ResourceNodeType.TypeRoot;
      break;
    }
    case PageType.SYNONYM: {
      if (page?.params?.synonymType === SynonymType.PUBLIC) {
        shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-synonym-true`);
        currentKey = `${db.id}-${db.name}-synonym-true-${page?.params?.synonymName}`;
        currentResourceNodeType = ResourceNodeType.PublicSynonym;
      } else if (page?.params?.synonymType === SynonymType.COMMON) {
        shouldExpandedKeys.push(db.id, `${db.id}-${db.name}-synonym-false`);
        currentKey = `${db.id}-${db.name}-synonym-false-${page?.params?.synonymName}`;
        currentResourceNodeType = ResourceNodeType.Synonym;
      }
      break;
    }
    case PageType.CREATE_SYNONYM: {
      if (page?.params?.synonymType === SynonymType.PUBLIC) {
        shouldExpandedKeys.push(db.id);
        currentKey = `${db.id}-${db.name}-synonym-true`;
        currentResourceNodeType = ResourceNodeType.PublicSynonymRoot;
      } else if (page?.params?.synonymType === SynonymType.COMMON) {
        shouldExpandedKeys.push(db.id);
        currentKey = `${db.id}-${db.name}-synonym-false`;
        currentResourceNodeType = ResourceNodeType.SynonymRoot;
      }
      break;
    }
  }
  if ([DatabaseGroup.project, DatabaseGroup.dataSource].includes(groupMode)) {
    shouldExpandedKeys = shouldExpandedKeys.filter((item) => {
      if (isString(item)) {
        return !item?.includes(TreeDataSecondGroupKey);
      }
      return true;
    });
  }
  return {
    shouldExpandedKeys,
    currentKey,
    currentResourceNodeType,
  };
};

const getShouldExpandedKeysByPage = (params: {
  page: IPage;
  db: IDatabase;
  groupMode: DatabaseGroup;
  datasourceId: number;
  databaseList: IDatabase[];
  setGroupMode: (group: DatabaseGroup) => void;
}) => {
  const { page, datasourceId, setGroupMode } = params;
  // 定位到数据源的情况
  if (
    [PageType.SESSION_PARAM, PageType.SESSION_MANAGEMENT, PageType.RECYCLE_BIN].includes(page.type)
  ) {
    setGroupMode(DatabaseGroup.dataSource);
    return getDataSourceShouldExpandedKeysByPage({ datasourceId });
  } else {
    // 定位到具体对象的情况
    return getObjectShouldExpandedKeysByPage(params);
  }
};

const openGlobalSearch = (node: TreeDataNode) => {
  let params;
  switch (node.type) {
    case ResourceNodeType.Database: {
      params = {
        initStatus: SearchStatus.databaseforObject,
        databaseId: node.data.id,
      };
      break;
    }
    case ResourceNodeType.GroupNodeProject: {
      const [, , mapId] = (node.key as String).split('-');
      params = {
        initStatus: SearchStatus.projectforObject,
        projectId: Number(mapId),
      };
      break;
    }
    case ResourceNodeType.GroupNodeDataSource: {
      const [, , mapId] = (node.key as String).split('-');
      params = {
        initStatus: SearchStatus.dataSourceforObject,
        dataSourceId: Number(mapId),
      };
      break;
    }
    case ResourceNodeType.SecondGroupNodeDataSource: {
      const [, , , mapId] = (node.key as String).split('-');
      params = {
        initStatus: SearchStatus.dataSourceforObject,
        dataSourceId: Number(mapId),
      };
      break;
    }
    // 数据库子节点的Root节点，定位到对应的数据库
    case ResourceNodeType.TableRoot:
    case ResourceNodeType.ViewRoot:
    case ResourceNodeType.FunctionRoot:
    case ResourceNodeType.ProcedureRoot:
    case ResourceNodeType.PackageRoot:
    case ResourceNodeType.TriggerRoot:
    case ResourceNodeType.TypeRoot:
    case ResourceNodeType.SequenceRoot:
    case ResourceNodeType.SynonymRoot:
    case ResourceNodeType.PublicSynonymRoot:
    case ResourceNodeType.MaterializedViewRoot:
    case ResourceNodeType.ExternalTableRoot:
    case ResourceNodeType.ExternalResourceRoot: {
      // 从key中解析数据库ID (格式: ${databaseId}-${dbName}-${type})
      const databaseId = node.data?.id;
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
        };
      }
      break;
    }
    // 具体的资源节点，定位到对应的数据库并预填搜索关键词和activeKey
    case ResourceNodeType.Table:
    case ResourceNodeType.ExternalTable: {
      // 从key中解析数据库ID (格式: ${databaseId}-${dbName}-table-${tableName})
      const keyParts = (node.key as string).split('-');
      const databaseId = Number(keyParts[0]);
      const tableName = node.data?.info?.tableName || node.title;
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
          initSearchKey: tableName,
          activeKey:
            node.type === ResourceNodeType.ExternalTable
              ? DbObjectType.external_table
              : DbObjectType.table,
        };
      }
      break;
    }
    case ResourceNodeType.View:
    case ResourceNodeType.MaterializedView: {
      const keyParts = (node.key as string).split('-');
      const databaseId = Number(keyParts[0]);
      const viewName = node.data?.viewName || node.title;
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
          initSearchKey: viewName,
          activeKey:
            node.type === ResourceNodeType.MaterializedView
              ? DbObjectType.materialized_view
              : DbObjectType.view,
        };
      }
      break;
    }
    case ResourceNodeType.Function: {
      const keyParts = (node.key as string).split('-');
      const databaseId = Number(keyParts[0]);
      const funcName = node.data?.funName || node.title;
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
          initSearchKey: funcName,
          activeKey: DbObjectType.function,
        };
      }
      break;
    }
    case ResourceNodeType.Procedure: {
      const keyParts = (node.key as string).split('-');
      const databaseId = Number(keyParts[0]);
      const procName = node.data?.proName || node.title;
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
          initSearchKey: procName,
          activeKey: DbObjectType.procedure,
        };
      }
      break;
    }
    case ResourceNodeType.Package:
    case ResourceNodeType.Trigger:
    case ResourceNodeType.Type:
    case ResourceNodeType.Sequence:
    case ResourceNodeType.Synonym:
    case ResourceNodeType.PublicSynonym:
    case ResourceNodeType.ExternalResource: {
      const keyParts = (node.key as string).split('-');
      const databaseId = Number(keyParts[0]);
      const objectName = node.title;
      // 根据节点类型映射到DbObjectType
      const objectTypeMap = {
        [ResourceNodeType.Package]: DbObjectType.package,
        [ResourceNodeType.Trigger]: DbObjectType.trigger,
        [ResourceNodeType.Type]: DbObjectType.type,
        [ResourceNodeType.Sequence]: DbObjectType.sequence,
        [ResourceNodeType.Synonym]: DbObjectType.synonym,
        [ResourceNodeType.PublicSynonym]: DbObjectType.synonym,
        [ResourceNodeType.ExternalResource]: DbObjectType.external_resource,
      };
      if (databaseId) {
        params = {
          initStatus: SearchStatus.databaseforObject,
          databaseId: databaseId,
          initSearchKey: objectName,
          activeKey: objectTypeMap[node.type],
        };
      }
      break;
    }
  }
  if (params) {
    modalStore.changeDatabaseSearchModalVisible(true, params);
  }
};

export {
  TreeDataGroupKey,
  TreeDataSecondGroupKey,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
  getShouldExpandedKeysByObject,
  getShouldExpandedKeysByPage,
  isGroupNode,
  GroupNodeToResourceNodeType,
  openGlobalSearch,
};
