import { ModalStore } from '@/store/modal';
import { openNewSQLPage } from '@/store/helper/page';
import { IProject } from '@/d.ts/project';
import { DbObjectTypeMap } from '../constant';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { useContext } from 'react';
import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';
import {
  getShouldExpandedKeysByObject,
  getGroupKey,
} from '@/page/Workspace/SideBar/ResourceTree/const';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { SearchStatus } from '../constant';
import { DbObjectType, IConnection } from '@/d.ts';
import { IDatabase, DatabaseGroup } from '@/d.ts/database';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';

const useActions = (params: { modalStore: ModalStore; project: IProject }) => {
  const { modalStore, project } = params;
  const activituContext = useContext(ActivityBarContext);
  const context = useContext(ResourceTreeContext);
  const { groupMode, setCurrentObject, setShouldExpandedKeys, setGroupMode } = context || {};

  /** 打开SQL窗口 */
  const openSql = (e, db) => {
    e.stopPropagation();
    modalStore?.changeDatabaseSearchModalVisible(false);
    db.id && openNewSQLPage(db.id, project ? 'project' : 'datasource');
  };

  /** 申请库权限 */
  const applyPermission = (e, db: IDatabase) => {
    e.stopPropagation();
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: db?.project?.id,
      databaseId: db?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  /** 申请表/视图权限 */
  const applyTablePermission = (e, object, type) => {
    e.stopPropagation();
    const dbObj = [DbObjectType.table, DbObjectType.external_table, DbObjectType.view]?.includes(
      type,
    )
      ? object
      : object?.dbObject;
    const params = {
      projectId: dbObj?.database?.project?.id,
      databaseId: dbObj?.database?.id,
      tableName: dbObj?.name,
      tableId: dbObj?.id,
    };
    modalStore.changeApplyTablePermissionModal(true, {
      ...params,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  /** 申请库权限 */
  const applyDbPermission = (e, db) => {
    e.stopPropagation();
    const dbObj = db?.dbObject?.database || db?.database || db;
    modalStore.changeApplyDatabasePermissionModal(true, {
      projectId: dbObj?.project?.id,
      databaseId: dbObj?.id,
    });
    modalStore.changeDatabaseSearchModalVisible(false);
  };

  const hasPermission = (object) => {
    return (
      object?.database?.authorizedPermissionTypes?.length ||
      object?.dbObject?.database?.authorizedPermissionTypes?.length
    );
  };

  /** 打开对象信息窗口 */
  const openTree = (e, object) => {
    if (!hasPermission(object)) return;
    const type = object?.type || DbObjectType.column;
    e.stopPropagation();
    const databaseId = object?.dbObject?.database?.id || object?.database?.id;

    if (type === DbObjectType.external_table) {
      object.isExternalTable = true;
    }
    DbObjectTypeMap?.[type]?.openPage(object)(
      ...DbObjectTypeMap?.[type]?.getOpenTab(object, databaseId),
    );
    modalStore?.changeDatabaseSearchModalVisible(false);
  };

  /** 打开并定位资源树上数据库、对象 */
  const positionResourceTree = (parmas: {
    type?: DbObjectType;
    database?: IDatabase;
    name?: string;
    objectName?: string;
  }) => {
    activituContext.setActiveKey(ActivityBarItemType.Database);
    const { type, database, name, objectName } = parmas;
    const keyObject = getShouldExpandedKeysByObject({
      type,
      database,
      groupMode,
      name,
      objectName,
    });
    setCurrentObject({
      value: keyObject.currentKey,
      type: keyObject.currentResourceNodeType,
    });
    setShouldExpandedKeys(keyObject.shouldExpandedKeys as React.Key[]);
    modalStore?.changeDatabaseSearchModalVisible(false);
  };

  /** 打开并定位资源树上的项目/数据源 */
  const positionProjectOrDataSource = (params: {
    status: SearchStatus;
    object: IProject | IConnection;
  }) => {
    activituContext.setActiveKey(ActivityBarItemType.Database);
    const { status, object } = params;
    switch (status) {
      case SearchStatus.forDataSource:
      case SearchStatus.dataSourceforObject: {
        setCurrentObject({
          value: getGroupKey(object.id, DatabaseGroup.dataSource),
          type: ResourceNodeType.GroupNodeDataSource,
        });
        setGroupMode(DatabaseGroup.dataSource);
        setShouldExpandedKeys([getGroupKey(object.id, DatabaseGroup.dataSource)]);
        break;
      }
      case SearchStatus.forProject:
      case SearchStatus.projectforObject: {
        setCurrentObject({
          value: getGroupKey(object.id, DatabaseGroup.project),
          type: ResourceNodeType.GroupNodeProject,
        });
        setGroupMode(DatabaseGroup.project);
        setShouldExpandedKeys([getGroupKey(object.id, DatabaseGroup.project)]);
      }
    }
    modalStore?.changeDatabaseSearchModalVisible(false);
  };

  return {
    openSql,
    applyPermission,
    applyTablePermission,
    applyDbPermission,
    openTree,
    positionResourceTree,
    positionProjectOrDataSource,
  };
};

export default useActions;
