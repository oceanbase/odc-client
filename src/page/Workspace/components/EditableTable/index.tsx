/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import DataGrid, { DataGridRef, SelectColumn } from '@oceanbase-odc/ob-react-data-grid';
import type {
  DataGridProps,
  Position,
  RowsChangeData,
} from '@oceanbase-odc/ob-react-data-grid/lib/types';
import { useControllableValue } from 'ahooks';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { SettingStore } from '@/store/setting';
import { generateUniqKey } from '@/util/utils';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import styles from './index.less';

export interface RowType<R = any> {
  _created?: boolean;
  _deleted?: boolean;
  modified?: boolean;
  _originRow?: R;
}

interface RefHandle {
  selectedRows: Set<React.Key>;
}

type PickDataGridProps<R, SR> = Pick<
  DataGridProps<R, SR>,
  | 'rows'
  | 'columns'
  | 'readonly'
  | 'enableRowRecord'
  | 'enableFilterRow'
  | 'enableSortRow'
  | 'onRowsChange'
  | 'contextMenuRender'
  | 'onRowClick'
  | 'pasteFormatter'
  | 'onSelectedRowsChange'
  | 'onSelectedColumnsChange'
  | 'getContextMenuConfig'
  | 'enableFrozenRow'
  | 'searchKey'
>;

interface IProps<R extends RowType<R>, SR> extends PickDataGridProps<R, SR> {
  settingStore?: SettingStore;
  ref: React.Ref<RefHandle>;
  rowKey: string;
  minHeight?: string;
  enableColumnRecord?: boolean;
  gridRef?: React.Ref<DataGridRef>;
  bordered?: boolean;
  theme?: 'dark' | 'white';
  onScroll?: (rowVisibleStartIdx: number, rowVisibleEndIdx: number) => void;
  getNewRowData?: () => R;
  /**
   * 只要cell或者rows选择改变，都会触发。
   * cellColumnsKey 只有在选择了cell的情况下才有值
   */
  onSelectChange?: (keys: React.Key[], cellColumnsKey?: React.Key[]) => void;
}

export default inject('settingStore')(
  observer(
    React.forwardRef(function EditableTable<R extends RowType, SR>(
      props: IProps<R, SR>,
      ref: React.Ref<RefHandle>,
    ) {
      const {
        columns,
        rows,
        rowKey,
        readonly,
        gridRef,
        minHeight,
        enableRowRecord,
        enableFilterRow = true,
        enableSortRow = true,
        bordered = true,
        enableColumnRecord = true,
        enableFrozenRow,
        searchKey,
        settingStore,
        theme,
        getNewRowData,
        onRowsChange,
        onScroll,
        contextMenuRender,
        onRowClick,
        pasteFormatter,
        getContextMenuConfig,
        onSelectChange,
      } = props;
      const innerGridRef = useRef<DataGridRef>(null);

      const [innerColumns, setInnerColumns] = useState([]);

      useEffect(() => {
        setInnerColumns([SelectColumn].concat(columns));
      }, [columns]);

      let [selectedRows, setSelectedRows] = useControllableValue<Set<React.Key>>(props, {
        defaultValue: new Set(),
        trigger: 'onSelectedRowsChange',
        valuePropName: 'selectedRows',
      });

      const innerOnSelectedRowsChange = useCallback(
        function (selectedRows: Set<React.Key>) {
          setSelectedRows(selectedRows);
          onSelectChange?.([...selectedRows]);
        },
        [setSelectedRows, onSelectChange],
      );

      useImperativeHandle(
        ref,
        () => {
          return {
            selectedRows,
          };
        },
        [selectedRows],
      );
      const rowKeyGetter = useCallback(
        (row: R) => {
          return row[rowKey];
        },
        [rowKey],
      );
      const onSelectedColumnsChange = function (keys: Set<React.Key>) {
        onSelectChange?.([], [...keys]);
      };
      const innerOnSelectedCellChange = useCallback(
        function (position: Position, row: any, columnKey: string) {
          const { rowIdx, endRowIdx, idx, endIdx } = position;
          if (rowIdx < 0) {
            onSelectChange?.([]);
          } else {
            onSelectChange?.(
              innerGridRef?.current?.rows
                ?.slice(Math.min(rowIdx, endRowIdx), Math.max(rowIdx, endRowIdx) + 1)
                .map((row) => rowKeyGetter(row)) || [],
              innerColumns
                ?.slice(Math.min(idx, endIdx), Math.max(idx, endIdx) + 1)
                .map((column) => column.key),
            );
          }
        },
        [rows, innerColumns, rowKeyGetter, onSelectChange],
      );

      const newData = useMemo(() => {
        return rows?.filter?.((row) => {
          return row._created;
        });
      }, [rows]);
      const deleteData = useMemo(() => {
        return rows?.filter?.((row) => {
          return row._deleted;
        });
      }, [rows]);
      const modifiedData = useMemo(() => {
        return rows
          ?.filter?.((row) => {
            return row._originRow;
          })
          .map((row) => row._originRow);
      }, [rows]);

      const innerOnRowsChange = useCallback(
        (nextRows: R[], data: RowsChangeData<R>) => {
          const { newRows, deletedRows, modifiedRows } = data;
          if (deletedRows?.length) {
            const deleteKeys = deletedRows.map((row) => {
              return rowKeyGetter(row);
            });
            onRowsChange?.(
              rows
                .map((row) => {
                  if (deleteKeys.includes(rowKeyGetter(row))) {
                    if (row._created) {
                      return null;
                    }
                    return {
                      ...row,
                      _deleted: true,
                    };
                  }
                  return row;
                })
                .filter(Boolean),
              data,
            );
            return;
          }
          newRows.forEach((row) => {
            const srcIdx = nextRows.findIndex((r) => rowKeyGetter(row) === rowKeyGetter(r));
            nextRows[srcIdx] = {
              ...nextRows[srcIdx],
              _created: true,
              [rowKey]: generateUniqKey(),
            };
          });
          modifiedRows.forEach((modifiedRow) => {
            const srcIdx = nextRows.findIndex((r) => rowKeyGetter(modifiedRow) === rowKeyGetter(r));
            if (nextRows[srcIdx]?._deleted || nextRows[srcIdx]?._created) return;
            nextRows[srcIdx] = {
              ...nextRows[srcIdx],
              modified: true,
            };
            if (!nextRows[srcIdx]._originRow) {
              nextRows[srcIdx] = {
                ...nextRows[srcIdx],
                _originRow: modifiedRow,
              };
            }
          });
          onRowsChange?.(nextRows, data);
        },
        [onRowsChange, rowKeyGetter, rowKey, rows],
      );

      const onRowReorder = useCallback(
        (srcRow, targetRow) => {
          const newRows = [...rows];
          const srcIdx = newRows.findIndex((r) => rowKeyGetter(srcRow) === rowKeyGetter(r));
          const targetIdx = newRows.findIndex((r) => rowKeyGetter(targetRow) === rowKeyGetter(r));
          newRows.splice(
            targetIdx > srcIdx ? targetIdx - 1 : targetIdx,
            0,
            newRows.splice(srcIdx, 1)[0],
          );
          onRowsChange(newRows, null);
        },
        [rows, rowKeyGetter],
      );

      const onColumnReorder = useCallback(
        (sourceKey, targetColumnKey) => {
          const newColumns = [...innerColumns];
          const srcIdx = newColumns.findIndex((r) => r.key === sourceKey);
          const targetIdx = newColumns.findIndex((r) => r.key === targetColumnKey);
          newColumns.splice(
            targetIdx > srcIdx ? targetIdx - 1 : targetIdx,
            0,
            newColumns.splice(srcIdx, 1)[0],
          );

          setInnerColumns(newColumns);
        },
        [innerColumns],
      );

      const innerOnScroll = useCallback(() => {
        onScroll?.(0, 10);
      }, [onScroll]);

      return (
        <DataGrid
          theme={theme || (settingStore.theme.sheetTheme as any)}
          style={{
            height: minHeight,
          }}
          className={classNames(styles.fillGrid, !bordered ? styles.removeBordered : '')}
          ref={(ref) => {
            innerGridRef.current = ref;
            //@ts-ignore
            gridRef ? (gridRef.current = ref) : null;
          }}
          columns={innerColumns}
          rows={rows}
          rowHeight={24}
          rowKeyGetter={rowKeyGetter}
          onRowsChange={innerOnRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={innerOnSelectedRowsChange}
          onScroll={innerOnScroll}
          enableRowRecord={enableRowRecord}
          enableFilterRow={enableFilterRow}
          enableSortRow={enableSortRow}
          readonly={readonly}
          newRows={newData}
          deletedRows={deleteData}
          getNewRowData={getNewRowData}
          modifiedRows={modifiedData}
          contextMenuRender={contextMenuRender}
          enableFrozenRow={enableFrozenRow}
          getContextMenuConfig={getContextMenuConfig}
          onSelectedColumnsChange={onSelectedColumnsChange}
          onSelectedCellChange={innerOnSelectedCellChange}
          onRowReorder={onRowReorder}
          onColumnReorder={enableColumnRecord ? onColumnReorder : null}
          onRowClick={onRowClick}
          pasteFormatter={pasteFormatter}
          searchKey={searchKey}
        />
      );
    }),
  ),
);
