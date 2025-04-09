import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import MaterializedViewPageContext from '../context';
import { formatMessage } from '@/util/intl';
import Toolbar from '@/component/Toolbar';
import TableCardLayout from '@/page/Workspace/components/CreateTable/TableCardLayout';
import EditToolbar from '@/page/Workspace/components/CreateTable/EditToolbar';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { generateUniqKey } from '@/util/utils';
import { ColumnStoreType, DBDefaultStoreType } from '@/d.ts/table';
import type SessionStore from '@/store/sessionManager/session';
import {
  TableIndex as ITableIndex,
  TableIndexMehod,
  TableIndexScope,
  TableIndexType,
} from '@/page/Workspace/components/CreateTable/interface';
import { clone, cloneDeep } from 'lodash';
import { useColumns } from '@/page/Workspace/components/CreateTable/TableIndex/columns';
import EditableTable from '@/page/Workspace/components/EditableTable';
import { generateUpdateMaterializedViewDDL } from '@/common/network/materializedView/index';

const defaultIndex: ITableIndex = {
  name: null,
  method: TableIndexMehod.BTREE,
  scope: TableIndexScope.LOCAL,
  columns: [],
  visible: true,
  type: TableIndexType.NORMAL,
  ordinalPosition: null,
  columnGroups: [],
};

function getDefaultColumnGroups(session: SessionStore) {
  if (!session?.supportFeature?.enableColumnStore || !session?.params?.defaultTableStoreFormat) {
    return [];
  }
  switch (session.params.defaultTableStoreFormat) {
    case DBDefaultStoreType.COLUMN:
      return [ColumnStoreType.COLUMN];
    case DBDefaultStoreType.ROW:
      return [ColumnStoreType.ROW];
    case DBDefaultStoreType.COMPOUND:
      return [ColumnStoreType.COLUMN, ColumnStoreType.ROW];
    default:
      return [];
  }
}

function removeGridParams(rows: any[]) {
  return rows.map((row) => Object.assign({}, row, { _originRow: null, key: null }));
}

interface IProps {}
const MvViewIndexes: React.FC<IProps> = () => {
  const [editIndexes, setEditIndexes] = useState(null);
  const gridRef = useRef<DataGridRef>();
  const { materializedView, session, onRefresh, showExecuteModal } = useContext(
    MaterializedViewPageContext,
  );
  const gridColumns: any[] = useColumns(materializedView.columns, session);

  const rows = useMemo(() => {
    return (
      (editIndexes || materializedView?.indexes)?.map((index, idx) => {
        return {
          ...index,
          key: `${index.name || ''}@@${idx}`,
        };
      }) || []
    );
  }, [materializedView.indexes, editIndexes]);

  useEffect(() => {
    gridRef.current?.setRows?.(rows ?? []);
  }, [rows]);

  return (
    <TableCardLayout
      toolbar={
        <EditToolbar
          modified={!!editIndexes?.length}
          onCancel={() => {
            setEditIndexes(null);
          }}
          onOk={async () => {
            const newData = cloneDeep(editIndexes);
            const { sql: updateTableDML, tip } = await generateUpdateMaterializedViewDDL({
              newData: {
                ...materializedView,
                indexes: newData,
              },
              oldData: materializedView,
              sessionId: session?.sessionId,
              dbName: session?.database?.dbName,
            });
            if (!updateTableDML) {
              return;
            }
            showExecuteModal?.(
              updateTableDML,
              materializedView?.info?.name,
              async () => {
                await onRefresh();
                setEditIndexes(null);
              },
              tip,
              async () => {
                await onRefresh();
                setEditIndexes(null);
              },
            );
          }}
        >
          <Toolbar>
            <Toolbar.Button
              text={formatMessage({ id: 'workspace.header.create', defaultMessage: '新建' })}
              icon={PlusOutlined}
              onClick={() => {
                const row = {
                  ...defaultIndex,
                  columnGroups: getDefaultColumnGroups(session),
                  key: generateUniqKey(),
                };
                gridRef.current?.addRows([row]);
              }}
            />
            <Toolbar.Button
              text={
                formatMessage({ id: 'odc.CreateTable.TableIndex.Delete', defaultMessage: '删除' }) //删除
              }
              icon={DeleteOutlined}
              onClick={() => {
                gridRef.current?.deleteRows();
              }}
            />
            <Toolbar.Button
              icon={<SyncOutlined />}
              text={formatMessage({
                id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                defaultMessage: '刷新',
              })}
              /* 刷新 */ onClick={onRefresh}
            />
          </Toolbar>
        </EditToolbar>
      }
    >
      <EditableTable
        rowKey="key"
        bordered={false}
        minHeight="100%"
        initialColumns={gridColumns}
        enableFilterRow
        enableFlushDelete
        initialRows={rows as any[]}
        enableRowRecord={true}
        enableColumnRecord={false}
        enableSortRow={false}
        gridRef={gridRef}
        onRowsChange={(rows) => {
          const newRows: any[] = clone(rows);
          setEditIndexes(removeGridParams(newRows));
        }}
      />
    </TableCardLayout>
  );
};

export default MvViewIndexes;
