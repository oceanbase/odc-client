import { ITable, ITableColumn } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
// @ts-ignore
import { tableModify } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import TableColumnModal from '@/component/TableColumnModal';
import { RowsChangeData } from '@alipay/ob-react-data-grid';
import CreateTableColumnForm from '../CreateTableColumnForm';

const defaultColumnModel = {
  modified: false,
  _deleted: false,
  _created: false,
};

@inject('sqlStore', 'schemaStore', 'pageStore')
@observer
export default class ColumnTab extends Component<
  {
    hideRawtableInfo?: boolean;
    hideOrder?: boolean;
    editable: boolean;
    modified: boolean;
    sqlStore?: SQLStore;
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    table: Partial<ITable>;
    tableName: string;
    pageKey: string;
    onUnsavedChange?: () => void;
    onReload: () => void;
    onUpdateColumns?: (columns) => void;
    onReset?: () => void;
  },
  {
    // 编辑列弹出的 SQL 确认框
    showColumnExecuteSQLModal: boolean;
    updateColumnDML: string;
    // 编辑列弹出框
    showColumnEditModal: boolean;
    columnIdxToEdit: number;
  }
> {
  /** 列操作相关 */

  public readonly state = {
    table: null,
    showColumnExecuteSQLModal: false,
    updateColumnDML: '',
    showColumnEditModal: false,
    columnIdxToEdit: -1,
  };

  public handleUpdateColumns = (
    newColumns: ITableColumn[],
    data: RowsChangeData<ITableColumn, any>,
  ) => {
    const { onUpdateColumns } = this.props;
    onUpdateColumns(newColumns);
  };

  public handleSaveColumns = async () => {
    const { schemaStore, tableName, table } = this.props;

    if (table.columns?.filter((c) => !c.columnName).length) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.column.validation.empty.columnName',
        }),
      );
      return;
    }

    if (table.columns?.filter((c) => !c.dataType).length) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.column.validation.empty.dataType',
        }),
      );
      return;
    }

    if (table.columns?.filter((c) => !this.checkColumnDataType(c.dataType)).length) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.column.dataType.length',
        }),
      );
      return;
    }

    // TODO：需要改成按顺序发请求？
    const sqls = await Promise.all(
      table.columns.map(async (column) => {
        column.tableName = tableName;
        if (column._created) {
          return schemaStore!.getColumnCreateSQL(tableName, column);
        } else if (column._deleted) {
          return schemaStore!.getColumnDeleteSQL(tableName, column);
        } else if (column.modified) {
          // delete column.initialValue;
          // delete column.modified;
          return schemaStore!.getColumnUpdateSQL(tableName, column);
        }
        return null;
      }),
    );
    const updateSQL = sqls?.filter(Boolean).join('\n').trim();
    if (updateSQL) {
      this.setState({
        showColumnExecuteSQLModal: true,
        updateColumnDML: updateSQL,
      });
    }
  };

  public handleExecuteColumnDML = async () => {
    const { sqlStore, tableName, onReload } = this.props;

    try {
      const isSuccess = await tableModify(this.state.updateColumnDML, tableName || '');
      if (isSuccess) {
        // 关闭对话框
        this.setState({
          showColumnExecuteSQLModal: false,
          updateColumnDML: null,
        });

        // 刷新列
        onReload();
      }
    } catch (e) {
      //
    }
  };

  public handleUpdateColumn = async (column: ITableColumn, isCreated: boolean) => {
    const { schemaStore, tableName, table } = this.props;
    const { columnIdxToEdit } = this.state;
    column = Object.assign({}, table.columns[columnIdxToEdit], column);
    const updateColumnDML = isCreated
      ? await schemaStore!.getColumnCreateSQL(tableName, column)
      : await schemaStore!.getColumnUpdateSQL(tableName, column);
    this.setState({
      showColumnExecuteSQLModal: true,
      showColumnEditModal: false,
      updateColumnDML,
    });
  };

  public handleMarkDeletedColumn = (rowId: number) => {
    const { table, onUpdateColumns } = this.props;
    const selectedColumn = table.columns[rowId];

    if (selectedColumn) {
      // 如果是新建的一行，直接删除
      if (selectedColumn._created) {
        table.columns.splice(rowId, 1);
      } else {
        // 否则标记
        selectedColumn._deleted = true;
        selectedColumn.modified = false;
      }
      onUpdateColumns([...(table.columns || [])]);
    }
  };

  public handleAddColumn = (column: Partial<ITableColumn>) => {
    const { table, onUpdateColumns } = this.props;

    onUpdateColumns(
      // @ts-ignore
      table.columns.concat({
        ...column,
        // 字段顺序不能编辑，因此也没必要生成
        // ordinalPosition: ,
        _created: true,
      }),
    );
  };

  public handleResetColumns = () => {
    const { pageStore, pageKey, tableName, table, onUpdateColumns, onReset } = this.props;

    onUpdateColumns(
      table.columns
        .filter((c) => !c._created) // 首先删掉新增的行
        // @ts-ignore
        .map((c) => {
          return {
            // @ts-ignore
            ...c,
            // @ts-ignore
            ...c.initialValue,
            comment: c.initialValue.comment,
            tableName: c.tableName,
            modified: false,
            _deleted: false,
            _originRow: null,
          };
        }),
    );

    if (onReset) {
      onReset();
    }

    pageStore!.updatePage(
      pageKey,
      {
        isSaved: true,
      },
      {
        tableName,
      },
    );
  };

  public render() {
    const { onReload, onUpdateColumns, table, editable, modified, hideOrder, hideRawtableInfo } =
      this.props;

    const { columnIdxToEdit, showColumnEditModal, updateColumnDML, showColumnExecuteSQLModal } =
      this.state;

    return (
      <>
        <CreateTableColumnForm
          hideRawtableInfo={hideRawtableInfo}
          hideOrder={hideOrder}
          hideBorder={true}
          fixedFooter={true}
          editable={editable}
          modified={modified}
          allowRefresh={true}
          allowReset={true}
          tableHeight="calc(100vh - 193px)"
          columns={(table && table.columns) || []}
          onRefresh={onReload}
          onUpdate={this.handleUpdateColumns}
          onSave={this.handleSaveColumns}
          onStartEditColumn={(idx) =>
            this.setState({
              showColumnEditModal: true,
              columnIdxToEdit: idx,
            })
          }
          onDeleteColumn={this.handleMarkDeletedColumn}
          onAddColumn={this.handleAddColumn}
          onReset={this.handleResetColumns}
        />
        <TableColumnModal
          model={
            (table.columns && table.columns[columnIdxToEdit]) || {
              ...defaultColumnModel,
            }
          }
          visible={showColumnEditModal}
          onCancel={() => this.setState({ showColumnEditModal: false })}
          onSave={this.handleUpdateColumn}
        />
        <ExecuteSQLModal
          sql={updateColumnDML}
          visible={showColumnExecuteSQLModal}
          onSave={this.handleExecuteColumnDML}
          onCancel={() => this.setState({ showColumnExecuteSQLModal: false })}
          onChange={(sql) => this.setState({ updateColumnDML: sql })}
        />
      </>
    );
  }

  private checkColumnDataType(value: string): boolean {
    const parenStart = value.indexOf('(');
    const parenEnd = value.indexOf(')');
    // 校验包含长度的数据类型
    if (parenStart > -1 && parenEnd > -1 && parenStart === parenEnd - 1) {
      return false;
    }
    return true;
  }
}
