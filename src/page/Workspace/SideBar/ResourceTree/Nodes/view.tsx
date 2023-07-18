import { fieldIconMap } from '@/constant';
import { DbObjectType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { PropsTab, TopTab } from '@/page/Workspace/components/ViewPage';
import { openViewViewPage } from '@/store/helper/page';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import ViewSvg from '@/svgr/menuView.svg';
import { convertDataTypeToDataShowType } from '@/util/utils';
import Icon, { FolderOpenFilled } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

export function ViewTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const views = dbSession?.database?.views;
  const treeData: TreeDataNode = {
    title: '视图',
    key: `${database.id}-${dbName}-view`,
    type: ResourceNodeType.ViewRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (views) {
    const dataTypes = sessionManager.sessionMap.get(dbSession?.sessionId)?.dataTypes;
    treeData.children = views.map((view) => {
      const viewKey = `${database.id}-${dbSession?.database?.viewVersion}-${dbName}-view-${view.viewName}`;
      let columnRoot: TreeDataNode;
      if (view.columns) {
        columnRoot = {
          title: '列',
          type: ResourceNodeType.ViewColumnRoot,
          key: `${viewKey}-view`,
          sessionId: dbSession?.sessionId,
          icon: (
            <FolderOpenFilled
              style={{
                color: '#3FA3FF',
              }}
            />
          ),
          children: view.columns?.map((c) => {
            return {
              title: c.columnName,
              key: `${viewKey}-view-${c.columnName}`,
              type: ResourceNodeType.ViewColumn,
              data: c,
              sessionId: dbSession?.sessionId,
              icon: convertDataTypeToDataShowType(c.type, dataTypes) && (
                <Icon
                  component={fieldIconMap[convertDataTypeToDataShowType(c.type, dataTypes)]}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),
              isLeaf: true,
            };
          }),
        };
      }

      return {
        title: view.viewName,
        key: viewKey,
        type: ResourceNodeType.View,
        data: view,
        dbObjectType: DbObjectType.view,
        doubleClick(session, node, databaseFrom) {
          openViewViewPage(
            view.viewName,
            TopTab.PROPS,
            PropsTab.DDL,
            session?.odcDatabase?.id,
            session?.odcDatabase?.name,
          );
        },
        icon: (
          <Icon
            type="view"
            component={ViewSvg}
            style={{
              color: 'var(--icon-color-1)',
              position: 'relative',
              top: 1,
            }}
          />
        ),
        sessionId: dbSession?.sessionId,
        isLeaf: false,
        children: view.columns ? [columnRoot].filter(Boolean) : null,
      };
    });
  }

  return treeData;
}
