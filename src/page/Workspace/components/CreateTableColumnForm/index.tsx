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

import Toolbar from '@/component/Toolbar';
import { IDataType, ITableColumn } from '@/d.ts';
import { SyncOutlined } from '@ant-design/icons';
import { RowsChangeData } from '@oceanbase-odc/ob-react-data-grid';
import memoizeOne from 'memoize-one';
import React, { Component } from 'react';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import EditableTable, { RowType } from '../EditableTable';
import { WrapAutoCompleteEditor } from '../EditableTable/Editors/AutoComplete';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import styles from './index.less';
import { formatMessage } from '@/util/intl';

const ToolbarButton = Toolbar.Button;

const enablePrimaryKeyEditor = false;

interface IProps {
  rowKey?: string;
  hideBorder?: boolean;
  fixedFooter?: boolean;
  modified: boolean;
  showRequired?: boolean;
  tableHeight?: string;
  allowRefresh?: boolean;
  allowReset?: boolean;
  enableRowRecord?: boolean;
  columns: Array<Partial<ITableColumn>>;
  onRefresh?: () => void;
  onCreated?: (val: any) => void;
}

export const defaultColumn = {
  columnName: '',
  dataType: '',
  allowNull: true,
  increment: false,
  defaultValue: '',
  comment: '',
};

export default class CreateTableColumnForm extends Component<
  IProps,
  {
    selectedRowIndex: number;
    showEditModal: boolean;
  }
> {
  public readonly state = {
    selectedRowIndex: -1,
    showEditModal: false,
  };

  public columnKeys: string[] = [];

  public gridRef: React.RefObject<DataGridRef> = React.createRef();

  private WrapSelectEditorMemo = memoizeOne((dataTypes) => {
    return WrapAutoCompleteEditor(
      dataTypes?.map((d: IDataType) => d.databaseType).filter(Boolean) || [],
    );
  });

  public handleRefreshColumn = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  /**
   * 判断是否可编辑
   */
  public handleCheckCellIsEditable = (columnKey, row, defaultEditable = false) => {
    if (row?.primaryKey && enablePrimaryKeyEditor) {
      /**
       * 主键不能编辑
       */
      return false;
    }
    if (columnKey === 'columnName' && row?._created) {
      return true;
    }
    return defaultEditable;
  };

  public onUpdate = (rows: ITableColumn[]) => {};

  public componentDidUpdate(prevProps: Readonly<IProps>) {
    const { columns } = this.props;
    if (prevProps.columns !== columns) {
      this.gridRef.current?.setRows?.(columns);
    }
  }

  public render() {
    const {
      hideBorder,
      fixedFooter,
      columns,
      allowRefresh,
      tableHeight,
      enableRowRecord,
    } = this.props;

    const tableColumns = [
      {
        key: 'columnName',
        name: formatMessage({ id: 'workspace.window.createTable.column.name' }),
        resizable: true,
        required: true,
        editable: (row) => this.handleCheckCellIsEditable('columnName', row),
        editor: TextEditor,
        formatter: ({ row }) => {
          if (row.primaryKey && enablePrimaryKeyEditor) {
            return formatMessage(
              {
                id: 'odc.components.CreateTableColumnForm.PrimaryKeyRowcolumnname',
              },
              { rowColumnName: row.columnName },
            );
          }
          return row.columnName || '';
        },
      },

      {
        key: 'dataType',
        name: formatMessage({
          id: 'workspace.window.createTable.column.dataType',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('dataType', row, true),
        filterable: false,
        required: true,
        editor: this.WrapSelectEditorMemo([]),
      },

      {
        key: 'comment',
        name: formatMessage({
          id: 'workspace.window.createTable.column.comment',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('comment', row, true),
        filterable: false,
        editor: TextEditor,
      },
    ].filter(Boolean);

    this.columnKeys = tableColumns.map((t) => t.key);
    return (
      <>
        <div
          className={styles.container}
          style={{
            height: fixedFooter ? 'calc(100vh - 115px)' : 'initial',
            border: hideBorder ? 'none' : '1px solid var(--odc-border-color)',
          }}
        >
          <Toolbar>
            {allowRefresh && (
              <ToolbarButton
                text={formatMessage({ id: 'workspace.window.session.button.refresh' })}
                icon={<SyncOutlined />}
                onClick={this.handleRefreshColumn}
              />
            )}
          </Toolbar>
          <EditableTable
            minHeight={tableHeight || '200px'}
            initialColumns={tableColumns}
            enableFilterRow
            initialRows={columns}
            rowKey="key"
            readonly={true}
            enableRowRecord={enableRowRecord}
            enableColumnRecord={false}
            enableSortRow={false}
            onSelectChange={(keys) => {
              const idx = columns.findIndex((c) => keys.includes(c.key));
              this.setState({ selectedRowIndex: idx });
            }}
            onRowsChange={this.onUpdate}
            gridRef={this.gridRef}
          />
        </div>
        {fixedFooter ? (
          <>
            <div className={styles.footer}></div>
          </>
        ) : null}
      </>
    );
  }
}
