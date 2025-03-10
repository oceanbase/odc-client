import { ResourceNodeType } from './type';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { DbObjectType } from '@/d.ts';
import { getMapIdByDB } from './helper';
import { isString } from 'lodash';
import modalStore from '@/store/modal';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { TreeDataNode } from '@/page/Workspace/SideBar/ResourceTree/type';
const isSupportQuickOpenGlobalSearchNodes = (type: ResourceNodeType, key) => {
  let isSupport = false;
  switch (type) {
    case ResourceNodeType.Database: {
      isSupport = true;
      break;
    }
    case ResourceNodeType.GroupNodeDataSource: {
      const [, , mapId] = key.split('-');
      if (Number(mapId) !== 0) {
        isSupport = true;
      }
      break;
    }
    case ResourceNodeType.GroupNodeProject: {
      isSupport = true;
      break;
    }
    case ResourceNodeType.SecondGroupNodeDataSource: {
      const [, , , mapId] = key.split('-');
      if (Number(mapId) !== 0) {
        isSupport = true;
      }
      break;
    }
  }
  return isSupport;
};

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
  const { mapId } = getMapIdByDB(db, groupMode);
  const { mapId: secondMapId } = getMapIdByDB(db, DatabaseGroup.dataSource);
  shouldExpandedKeys.push(
    getGroupKey(mapId, groupMode),
    getSecondGroupKey(mapId, secondMapId, groupMode),
  );
  if ([DatabaseGroup.project, DatabaseGroup.dataSource, DatabaseGroup.tenant].includes(groupMode)) {
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
  if (groupMode !== DatabaseGroup.none) {
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
      currentKey = `${db.id}-${db.name}-sequence-false-${name}`;
      currentResourceNodeType = ResourceNodeType.Synonym;
      break;
    }
  }
  if ([DatabaseGroup.project, DatabaseGroup.dataSource, DatabaseGroup.tenant].includes(groupMode)) {
    shouldExpandedKeys = shouldExpandedKeys.filter((item) => {
      if (isString(item)) {
        return !item.includes(TreeDataSecondGroupKey);
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
  }
  modalStore.changeDatabaseSearchModalVisible(true, params);
};

export {
  TreeDataGroupKey,
  TreeDataSecondGroupKey,
  getGroupKey,
  getSecondGroupKey,
  getShouldExpandedGroupKeys,
  getShouldExpandedKeysByObject,
  isSupportQuickOpenGlobalSearchNodes,
  isGroupNode,
  GroupNodeToResourceNodeType,
  openGlobalSearch,
};
