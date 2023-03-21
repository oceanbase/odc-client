import Toolbar from '@/component/Toolbar';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { DataGridRef } from '@alipay/ob-react-data-grid';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import EditableTable from '../../EditableTable';
import TableContext from '../TableContext';
import { useColumns } from './columns';

import { generateUpdateTableDDL } from '@/common/network/table';
import classnames from 'classnames';
import { cloneDeep, isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import TablePageContext from '../../TablePage/context';
import { useTableConfig } from '../config';
import EditToolbar from '../EditToolbar';
import { removeGridParams } from '../helper';
import { TableColumn } from '../interface';
import TableCardLayout from '../TableCardLayout';
import styles from './index.less';
interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
}

export const defaultColumn: TableColumn = {
  name: '',
  type: null,
  width: null,
  scale: null,
  notNull: false,
  autoIncrement: null,
  generated: false,
  comment: null,
  character: null,
  collation: null,
  unsigned: null,
  zerofill: null,
  currentTime: false,
  enumMembers: [],
};

const Columns: React.FC<IProps> = function ({ schemaStore, connectionStore }) {
  const tableContext = useContext(TableContext);
  const pageContext = useContext(TablePageContext);
  const editMode = pageContext?.editMode;
  const columns = tableContext?.columns;
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const gridColumns = useColumns({ schemaStore, connectionStore }, columns);
  const gridRef = useRef<DataGridRef>();
  const config = useTableConfig(connectionStore);
  const [editColumns, setEditColumns] = useState(null);
  const displayColumns = editColumns || columns;
  const rows = useMemo(() => {
    return displayColumns.map((column, idx) => {
      return {
        ...column,
        key: isNil(column.ordinalPosition)
          ? `${column.name || ''}@@${idx}`
          : column.ordinalPosition,
      };
    });
  }, [displayColumns]);

  const focusRowIdx = selectedRowsIdx?.length === 1 ? selectedRowsIdx?.[0] : -1;
  const ColumnExtraComponent = config.ColumnExtraComponent;

  const onSelectChange = useCallback(
    (keys) => {
      setSelectedRowIdx(
        keys.map((key) => {
          return rows.findIndex((row) => row.key === key);
        }),
      );
    },
    [rows],
  );

  const onRowsChange = useCallback((rows, data) => {
    let newRows: any[] = cloneDeep(rows);
    newRows.forEach((row) => {
      /**
       * 自增列去除表达式和默认值
       */
      if (row.autoIncrement) {
        row.defaultValueOrExpr = null;
      }
    });
    if (editMode) {
      setEditColumns(removeGridParams(newRows));
    } else {
      tableContext.setColumns(removeGridParams(newRows));
    }
  }, []);
  const haveColumnExtra = !!ColumnExtraComponent;
  return (
    <div className={styles.main}>
      <div
        className={classnames(styles.content, {
          [styles.contentWithExtraColumn]: haveColumnExtra,
        })}
      >
        <TableCardLayout
          toolbar={
            <EditToolbar
              modified={!!editColumns}
              onCancel={() => {
                setEditColumns(null);
              }}
              onOk={async () => {
                const newColumns = cloneDeep(editColumns);
                const updateTableDML = await generateUpdateTableDDL(
                  {
                    ...pageContext.table,
                    columns: newColumns,
                  },

                  pageContext.table,
                );

                if (!updateTableDML) {
                  return;
                }
                await pageContext.showExecuteModal?.(
                  updateTableDML,
                  pageContext?.table?.info?.tableName,
                  async () => {
                    await pageContext.onRefresh();
                    setEditColumns(null);
                  },
                );
              }}
            >
              <Toolbar>
                <Toolbar.Button
                  text={formatMessage({ id: 'workspace.header.create' })}
                  icon={PlusOutlined}
                  onClick={() => {
                    if (editMode) {
                      setEditColumns(displayColumns.concat(defaultColumn));
                    } else {
                      tableContext.setColumns(tableContext.columns.concat(defaultColumn));
                    }
                  }}
                />

                <Toolbar.Button
                  text={
                    formatMessage({ id: 'odc.CreateTable.Columns.Delete' }) //删除
                  }
                  icon={DeleteOutlined}
                  disabled={!selectedRowsIdx?.length}
                  onClick={() => {
                    let newRows = [...rows]?.filter((row, index) => {
                      return !selectedRowsIdx?.includes(index);
                    });
                    if (editMode) {
                      setEditColumns(removeGridParams(newRows));
                    } else {
                      tableContext.setColumns(removeGridParams(newRows));
                    }
                  }}
                />

                {pageContext?.editMode && (
                  <Toolbar.Button
                    icon={<SyncOutlined />}
                    text={formatMessage({
                      id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                    })}
                    /* 刷新 */ onClick={pageContext.onRefresh}
                  />
                )}
              </Toolbar>
            </EditToolbar>
          }
        >
          <EditableTable
            bordered={false}
            minHeight="100%"
            columns={gridColumns}
            enableFilterRow
            rows={rows as any[]}
            rowKey={'key'}
            /**
             * 编辑状态下不允许调整字端顺序
             */
            enableRowRecord={!pageContext?.editMode}
            enableColumnRecord={false}
            enableSortRow={false}
            onSelectChange={onSelectChange}
            gridRef={gridRef}
            onRowsChange={onRowsChange}
          />
        </TableCardLayout>
      </div>
      {haveColumnExtra && (
        <div className={styles.bottom}>
          <ColumnExtraComponent
            originColumns={columns}
            column={rows[focusRowIdx]}
            onChange={(newColumn: TableColumn) => {
              const newColumns = [...displayColumns];
              newColumns.splice(focusRowIdx, 1, newColumn);
              if (editMode) {
                setEditColumns(newColumns);
              } else {
                tableContext.setColumns(newColumns);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default inject('schemaStore', 'connectionStore')(observer(Columns));
