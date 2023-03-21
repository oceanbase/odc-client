import type { ITable, ITableIndex } from '@/d.ts';
import type { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
// @ts-ignore
import { tableModify } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import TableIndexModal from '@/component/TableIndexModal';
import type { ConnectionStore } from '@/store/connection';
import { getRangeInitialValue, isRangeDisabled } from '@/util/utils';
import type { RowsChangeData } from '@alipay/ob-react-data-grid';
import { clone } from 'lodash';
import CreateTableIndexForm from '../CreateTableIndexForm';

const defaultColumnModel = {
  modified: false,
  _deleted: false,
  _created: false,
};

@inject('sqlStore', 'schemaStore', 'pageStore', 'connectionStore')
@observer
export default class IndexTab extends Component<
  {
    modified: boolean;
    sqlStore?: SQLStore;
    pageStore?: PageStore;
    schemaStore?: SchemaStore;
    connectionStore?: ConnectionStore;
    table: Partial<ITable>;
    tableName: string;
    pageKey: string;
    onUnsavedChange: () => void;
    onReload: () => Promise<void>;
    onUpdateIndexes: (indexs) => void;
    onReset?: () => void;
  },
  {
    // 编辑列弹出的 SQL 确认框
    showColumnExecuteSQLModal: boolean;
    updateColumnDML: string;
    // 编辑列弹出框
    showColumnEditModal: boolean;
    indexIdxToEdit: number;
  }
> {
  /** 列操作相关 */

  public readonly state = {
    table: null,
    showColumnExecuteSQLModal: false,
    updateColumnDML: '',
    showColumnEditModal: false,
    indexIdxToEdit: -1,
  };

  public handleUpdateIndexes = (
    newIndexes: ITableIndex[],
    data: RowsChangeData<ITableIndex, any>,
  ) => {
    const { onUpdateIndexes } = this.props;
    onUpdateIndexes(newIndexes);
  };

  public handleSaveIndexes = async () => {
    const { schemaStore, tableName, table } = this.props;

    if (table.indexes.filter((i) => !i.name).length) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.index.name.validation',
        }),
      );
      return;
    }

    if (table.indexes.filter((i) => !i.columnNames).length) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.index.columnNames.validation',
        }),
      );

      return;
    }

    const sqls = await Promise.all(
      table.indexes?.map(async (index) => {
        index.tableName = tableName;
        if (index._created) {
          return schemaStore!.getIndexCreateSQL(tableName, index);
        }
        if (index._deleted) {
          return schemaStore!.getIndexDeleteSQL(tableName, index);
        }
        // 索引不支持编辑，只能先删除再创建，和字段不同
        return null;
      }),
    );

    const updateColumnDML = sqls && sqls.filter((s) => s).join('\n');

    if (updateColumnDML) {
      this.setState({
        showColumnExecuteSQLModal: true,
        updateColumnDML,
      });
    }
  };

  public handleExecuteColumnDML = async () => {
    const { sqlStore, tableName, onReload } = this.props;

    try {
      const isSuccess = await tableModify(this.state.updateColumnDML, tableName);
      if (isSuccess) {
        // 关闭对话框
        this.setState({
          showColumnExecuteSQLModal: false,
          updateColumnDML: null,
        });

        message.success(formatMessage({ id: 'workspace.window.createTable.index.success' }));

        // 刷新列
        onReload();
      }
    } catch (e) {
      //
    }
  };

  public handleCreateIndex = async (index: ITableIndex) => {
    const { schemaStore, tableName } = this.props;
    if (!index.columnNames?.length) {
      message.warn(
        formatMessage({
          id: 'odc.components.TablePage.IndexTab.TheIndexColumnMustBe',
        }), // 索引列不能为空
      );
      return;
    }
    const updateColumnDML = await schemaStore!.getIndexCreateSQL(tableName, index);
    if (updateColumnDML) {
      this.setState({
        showColumnExecuteSQLModal: true,
        showColumnEditModal: false,
        updateColumnDML,
      });
    }
  };

  public handleMarkDeletedIndex = (rowId: number) => {
    const { table, onUpdateIndexes } = this.props;
    const selectedColumn = table.indexes[rowId];

    if (selectedColumn) {
      // 如果是新建的一行，直接删除
      if (selectedColumn._created) {
        table.indexes.splice(rowId, 1);
      } else {
        // 否则标记
        selectedColumn._deleted = true;
        selectedColumn.modified = false;
      }
      onUpdateIndexes(table.indexes);
    }
  };

  public handleCancelMarkDeletedIndex = (rowId: number) => {
    const { table, onUpdateIndexes } = this.props;
    const selectedColumn = table.indexes[rowId];

    if (selectedColumn) {
      if (selectedColumn._deleted) {
        selectedColumn._deleted = false;
      }
      onUpdateIndexes(table.indexes);
    }
  };

  public handleAddIndex = (index: Partial<ITableIndex>) => {
    const { table, onUpdateIndexes } = this.props;

    // @ts-ignore
    onUpdateIndexes(
      // @ts-ignore
      table.indexes.concat({
        ...index,
        _created: true,
      }),
    );
  };

  public handleResetIndexes = () => {
    const { pageStore, pageKey, tableName, table, onUpdateIndexes, onReset } = this.props;

    onUpdateIndexes(
      table.indexes
        .filter((c) => !c._created) // 首先删掉新增的行
        // @ts-ignore
        .map((c) => {
          return {
            // @ts-ignore
            ...c,
            // @ts-ignore
            ...c.initialValue,
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
      { isSaved: true },
      {
        tableName,
      },
    );
  };

  public render() {
    const {
      modified,
      onReload,
      table,
      schemaStore: { dataTypes },
      connectionStore: { connection },
      onUpdateIndexes,
    } = this.props;

    const { indexIdxToEdit, showColumnEditModal, updateColumnDML, showColumnExecuteSQLModal } =
      this.state;

    const rangeDisabled = isRangeDisabled(table && table.partitioned, connection.dbMode);
    const rangeInitialValue = getRangeInitialValue(table && table.partitioned, connection.dbMode);

    return (
      <>
        <CreateTableIndexForm
          hideBorder={true}
          fixedFooter={true}
          modified={modified}
          allowRefresh={true}
          allowReset={true}
          rangeDisabled={rangeDisabled}
          rangeInitialValue={rangeInitialValue}
          tableHeight="calc(100vh - 193px)"
          columns={(table && table.columns) || []}
          indexes={(table && table.indexes) || []}
          onRefresh={onReload}
          onUpdate={this.handleUpdateIndexes}
          onSave={this.handleSaveIndexes}
          onStartEditIndex={(idx) =>
            this.setState({
              showColumnEditModal: true,
              indexIdxToEdit: idx,
            })
          }
          onDeleteIndex={this.handleMarkDeletedIndex}
          onCancelDeleteIndex={this.handleCancelMarkDeletedIndex}
          onAddIndex={this.handleAddIndex}
          onReset={this.handleResetIndexes}
          onModified={() => onUpdateIndexes(clone(table.indexes))}
        />

        <TableIndexModal
          dataTypes={dataTypes}
          rangeDisabled={rangeDisabled}
          rangeInitialValue={rangeInitialValue}
          model={
            (table.indexes && table.indexes[indexIdxToEdit]) || {
              ...defaultColumnModel,
            }
          }
          columns={table.columns}
          visible={showColumnEditModal}
          onCancel={() => this.setState({ showColumnEditModal: false })}
          onSave={this.handleCreateIndex}
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
}
