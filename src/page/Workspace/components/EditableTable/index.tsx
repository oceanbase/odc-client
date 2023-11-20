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
import type { DataGridProps } from '@oceanbase-odc/ob-react-data-grid/lib/types';
import React, { useRef } from 'react';
import { SettingStore } from '@/store/setting';
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
  | 'initialRows'
  | 'initialColumns'
  | 'onRowsChange'
  | 'contextMenuRender'
  | 'pasteFormatter'
  | 'getContextMenuConfig'
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
  readonly?: boolean;
  enableRowRecord?: boolean;
  enableFilterRow?: boolean;
  enableSortRow?: boolean;
  enableFrozenRow?: boolean;
  searchKey?: string;
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
        initialColumns,
        initialRows,
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
        onRowsChange,
        contextMenuRender,
        pasteFormatter,
        getContextMenuConfig,
        onSelectChange,
      } = props;
      const innerGridRef = useRef<DataGridRef>(null);
      const innerColumns = [SelectColumn].concat(initialColumns);

      if(innerColumns?.length <= 1){
        return null
      }

      return (
        <DataGrid
          initialRows={initialRows}
          initialColumns={innerColumns}
          rowKeyName={rowKey}
          options={{
            enableRowRecord,
            enableFilterRow,
            enableSortRow,
            readonly,
            enableFrozenRow,
            enableColumnRecord,
            theme: theme || (settingStore.theme.sheetTheme as any),
            searchKey,
            rowHeight: 24
          }}
          style={{
            height: minHeight,
          }}
          className={classNames(styles.fillGrid, !bordered ? styles.removeBordered : '')}
          ref={(ref) => {
            innerGridRef.current = ref;
            //@ts-ignore
            gridRef ? (gridRef.current = ref) : null;
          }}
          onRowsChange={onRowsChange}
          onSelectChange={onSelectChange}
          contextMenuRender={contextMenuRender}
          getContextMenuConfig={getContextMenuConfig}
          pasteFormatter={pasteFormatter}
        />
      );
    }),
  ),
);
