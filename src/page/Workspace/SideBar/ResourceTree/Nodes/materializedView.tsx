import SessionStore from '@/store/sessionManager/session';
import { IDatabase } from '@/d.ts/database';
import { ResourceNodeType, TreeDataNode } from '../type';
import Icon, { FolderOpenFilled } from '@ant-design/icons';
import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg';
import { openMaterializedViewViewPage } from '@/store/helper/page';
import { PropsTab, TopTab } from '@/page/Workspace/components/ViewPage';
import { formatMessage } from '@/util/intl';
import { ReactComponent as IndexSvg } from '@/svgr/index.svg';
import { ReactComponent as PartitionSvg } from '@/svgr/Partition.svg';
import { TablePrimaryConstraint } from '../../../components/CreateTable/interface';
import { DbObjectType, IPartitionType } from '@/d.ts';
import { convertDataTypeToDataShowType } from '@/util/utils';
import { fieldIconMap } from '@/constant';
import sessionManager from '@/store/sessionManager';

export const MaterializedViewTreeData = (dbSession: SessionStore, database: IDatabase) => {
  const dbName = database.name;
  const materializedViews = dbSession?.database?.materializedView;
  const treeData: TreeDataNode = {
    title: '物化视图',
    key: `${database.id}-${dbName}-materializedView`,
    type: ResourceNodeType.MaterializedViewRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (materializedViews) {
    const dataTypes = sessionManager.sessionMap.get(dbSession?.sessionId)?.dataTypes;
    treeData.children = materializedViews.map((item) => {
      const materializedViewKey = `${database.id}-${dbName}-materializedView-${item?.info?.name}`;
      let MaterializedViewColumnRoot: TreeDataNode;
      if (item.columns) {
        MaterializedViewColumnRoot = {
          title: '列',
          type: ResourceNodeType.MaterializedViewColumnRoot,
          key: `${materializedViewKey}-column`,
          data: item,
          sessionId: dbSession?.sessionId,
          icon: (
            <FolderOpenFilled
              style={{
                color: 'var(--icon-color-5)',
              }}
            />
          ),
          children: item?.columns?.map((c) => {
            return {
              title: c.name,
              key: `${materializedViewKey}-column-${c?.name}`,
              type: ResourceNodeType.MaterializedViewColumn,
              data: c,
              sessionId: dbSession?.sessionId,
              icon: convertDataTypeToDataShowType(c.type, dataTypes) && (
                <Icon
                  component={fieldIconMap[convertDataTypeToDataShowType(c.type, dataTypes)]}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),
              isLeaf: true,
            };
          }),
        };
      }
      let indexRoot: TreeDataNode;
      if (item.indexes?.length) {
        indexRoot = {
          title: formatMessage({
            id: 'odc.ResourceTree.Nodes.table.Index',
            defaultMessage: '索引',
          }), //索引
          type: ResourceNodeType.MaterializedViewIndexRoot,
          key: `${materializedViewKey}-index`,
          data: item,
          icon: (
            <FolderOpenFilled
              style={{
                color: 'var(--icon-color-5)',
              }}
            />
          ),
          sessionId: dbSession?.sessionId,
          children: item.indexes?.map((c) => {
            return {
              title: c.name,
              key: `${materializedViewKey}-index-${c.name}`,
              type: ResourceNodeType.MaterializedViewIndex,
              data: c,
              icon: (
                <Icon
                  component={IndexSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              sessionId: dbSession?.sessionId,
              isLeaf: true,
            };
          }),
        };
      }
      let partitionRoot: TreeDataNode = {
        title: formatMessage({
          id: 'odc.ResourceTree.Nodes.table.Partition',
          defaultMessage: '分区',
        }), //分区
        type: ResourceNodeType.MaterializedViewPartitionRoot,
        key: `${materializedViewKey}-partition`,
        data: item,
        sessionId: dbSession?.sessionId,
        icon: (
          <FolderOpenFilled
            style={{
              color: 'var(--icon-color-5)',
            }}
          />
        ),
      };
      const subpartitionsDataHelper = (key, partitions, name) => {
        if (!partitions) return [];
        return partitions
          ?.filter((_s) => _s?.parentName === name)
          ?.map((s) => {
            return {
              title: s.name,
              key: `${key}-${s.name}`,
              isLeaf: true,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: '#3FA3FF',
                  }}
                />
              ),
              type: ResourceNodeType.MaterializedViewPartition,
            };
          });
      };
      switch (item.partitions?.partType) {
        case IPartitionType.HASH: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-hash-${p.name}`;
            return {
              title: 'HASH',
              key: key,
              isLeaf: !item.subpartitions,
              // @ts-ignore
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),
              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        case IPartitionType.KEY: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-key-${p.name}`;
            return {
              title: 'KEY',
              key: key,
              isLeaf: !item.subpartitions,
              // @ts-ignore
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),
              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        case IPartitionType.LIST: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-list-${p.name}`;
            return {
              title: p.name,
              key: key,
              isLeaf: !item.subpartitions,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        case IPartitionType.LIST_COLUMNS: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-list-${p.name}`;
            return {
              title: p.name,
              key: key,
              isLeaf: !item.subpartitions,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        case IPartitionType.RANGE: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-list-${p.name}`;
            return {
              title: p.name,
              key: key,
              isLeaf: !item.subpartitions,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        case IPartitionType.RANGE_COLUMNS: {
          partitionRoot.children = item.partitions.partitions.map((p) => {
            const key = `${materializedViewKey}-partition-list-${p.name}`;
            return {
              title: p.name,
              key: key,
              isLeaf: !item.subpartitions,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={PartitionSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              type: ResourceNodeType.MaterializedViewPartition,
              children: subpartitionsDataHelper(key, item.subpartitions?.partitions, p.name),
            };
          });
          break;
        }
        default: {
          partitionRoot = null;
        }
      }
      let constraintRoot: TreeDataNode;
      let constraint: TablePrimaryConstraint[] = [].concat(item.primaryConstraints).filter(Boolean);
      if (constraint.length) {
        constraintRoot = {
          title: formatMessage({
            id: 'odc.ResourceTree.Nodes.table.Constraints',
            defaultMessage: '约束',
          }), //约束
          type: ResourceNodeType.MaterializedViewConstraintRoot,
          key: `${materializedViewKey}-constraint`,
          data: item,
          sessionId: dbSession?.sessionId,
          icon: (
            <FolderOpenFilled
              style={{
                color: 'var(--icon-color-5)',
              }}
            />
          ),
          children: constraint.map((c) => {
            return {
              title: c.name,
              type: ResourceNodeType.MaterializedViewConstraint,
              isLeaf: true,
              data: item,
              sessionId: dbSession?.sessionId,
              icon: (
                <Icon
                  component={IndexSvg}
                  style={{
                    color: 'var(--icon-color-5)',
                  }}
                />
              ),

              key: `${materializedViewKey}-constraint-${c.name}`,
            };
          }),
        };
      }
      return {
        title: item?.info?.name,
        key: materializedViewKey,
        type: ResourceNodeType.MaterializedView,
        dbObjectType: DbObjectType.materialized_view,
        data: item,
        doubleClick(session, node) {
          openMaterializedViewViewPage(
            item?.info?.name,
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
              color: 'var(--icon-color-5)',
              position: 'relative',
              top: 1,
            }}
          />
        ),
        sessionId: dbSession?.sessionId,
        isLeaf: false,
        children: item.columns
          ? [MaterializedViewColumnRoot, indexRoot, partitionRoot, constraintRoot].filter(Boolean)
          : null,
      };
    });
  }
  return treeData;
};
