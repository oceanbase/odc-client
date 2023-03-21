import { ConnectionMode, IDataType, ITableColumn } from '@/d.ts';
import { DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Divider } from 'antd';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { formatMessage, FormattedMessage, getLocale } from 'umi';
// @ts-ignore
import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import Toolbar from '@/component/Toolbar';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { generateUniqKey, isSupportAutoIncrement } from '@/util/utils';
import { RowsChangeData } from '@alipay/ob-react-data-grid';
import memoizeOne from 'memoize-one';
import EditableTable, { RowType } from '../EditableTable';
import { WrapAutoCompleteEditor } from '../EditableTable/Editors/AutoComplete';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import WrapCheckboxFormatetr, { WrapOracleCheckboxFormatetr } from './CheckboxFormatter';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

const enablePrimaryKeyEditor = false;

interface IProps {
  rowKey?: string;
  hideRawtableInfo?: boolean;
  hideOrder?: boolean;
  hideBorder?: boolean;
  fixedFooter?: boolean;
  editable: boolean;
  modified: boolean;
  showRequired?: boolean;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  tableHeight?: string;
  allowRefresh?: boolean;
  allowReset?: boolean;
  enableRowRecord?: boolean;
  columns: Array<Partial<ITableColumn>>;
  onAddColumn: (column: Partial<ITableColumn>) => void;
  onSave: () => void;
  onRefresh?: () => void;
  onUpdate: (newRows: ITableColumn[], data: RowsChangeData<any, any>) => void;
  onStartEditColumn: (rowIdx: number) => void;
  onDeleteColumn: (rowIdx: number) => void;
  onReset?: () => void;
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

@inject('schemaStore', 'connectionStore')
@observer
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

  private WrapSelectEditorMemo = memoizeOne((dataTypes) => {
    return WrapAutoCompleteEditor(
      dataTypes?.map((d: IDataType) => d.databaseType).filter(Boolean) || [],
    );
  });

  private WrapCheckboxFormatterMemo = memoizeOne(
    (editable: boolean, enablePrimaryKeyEditor: boolean) => {
      return WrapCheckboxFormatetr(editable, enablePrimaryKeyEditor);
    },
  );

  private WrapOracleCheckboxFormatterMemo = memoizeOne((editable: boolean) => {
    return WrapOracleCheckboxFormatetr(editable);
  });

  public handleSubmit = async () => {
    this.props.onSave();
  };

  public handleAddColumn = () => {
    this.props.onAddColumn({ ...defaultColumn, key: generateUniqKey() });
  };

  public handleEditColumn = () => {
    this.props.onStartEditColumn(this.state.selectedRowIndex);
  };

  public handleDeleteColumn = () => {
    this.props.onDeleteColumn(this.state.selectedRowIndex);
  };

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

  public onUpdate = (rows: ITableColumn[], data: RowsChangeData<RowType<any>>) => {
    if (!data) {
      this.props.onUpdate(rows, data);
      return;
    }
    const { indexes } = data;
    indexes?.forEach((rowIdx) => {
      const row = rows[rowIdx];
      if (!isSupportAutoIncrement(row['dataType'])) {
        rows[rowIdx] = {
          ...row,
          autoIncreament: false,
        };
      }
    });
    this.props.onUpdate(rows, data);
  };

  public render() {
    const {
      hideBorder,
      hideOrder,
      hideRawtableInfo,
      fixedFooter,
      editable,
      modified,
      columns,
      allowRefresh,
      allowReset,
      tableHeight,
      schemaStore,
      rowKey,
      enableRowRecord,
      onCreated,
      connectionStore,
    } = this.props;

    const { selectedRowIndex } = this.state;

    let dataTypes;
    if (schemaStore) {
      dataTypes = schemaStore.dataTypes;
    }
    const dbMode =
      (connectionStore && connectionStore.connection && connectionStore.connection.dbMode) ||
      ConnectionMode.OB_MYSQL;
    const isEn = getLocale() === 'en-US';

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

      !hideOrder && {
        key: 'ordinalPosition',
        name: formatMessage({
          id: 'workspace.window.createTable.column.position',
        }),
        resizable: true,
        filterable: false,
        editable: (row) => this.handleCheckCellIsEditable('ordinalPosition', row),
        width: isEn ? 120 : 90,
      },

      {
        key: 'dataType',
        name: formatMessage({
          id: 'workspace.window.createTable.column.dataType',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('dataType', row, editable),
        filterable: false,
        required: true,
        editor: this.WrapSelectEditorMemo(dataTypes),
      },

      !hideRawtableInfo && {
        key: 'allowNull',
        name: formatMessage({
          id: 'workspace.window.createTable.column.allowNull',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('allowNull', row),
        filterable: false,
        width: isEn ? 130 : 100,
        formatter: this.WrapCheckboxFormatterMemo(editable, enablePrimaryKeyEditor),
      },

      !hideRawtableInfo &&
        dbMode !== ConnectionMode.OB_ORACLE && {
          key: 'autoIncreament',
          name: formatMessage({
            id: 'workspace.window.createTable.column.increment',
          }),
          resizable: true,
          filterable: false,
          editable: (row) => this.handleCheckCellIsEditable('autoIncreament', row),
          width: isEn ? 80 : 50,
          formatter: this.WrapOracleCheckboxFormatterMemo(editable),
        },

      !hideRawtableInfo && {
        key: 'defaultValue',
        name: formatMessage({
          id: 'workspace.window.createTable.column.defaultValue',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('defaultValue', row, editable),
        filterable: false,
        editor: TextEditor,
      },

      {
        key: 'comment',
        name: formatMessage({
          id: 'workspace.window.createTable.column.comment',
        }),
        resizable: true,
        editable: (row) => this.handleCheckCellIsEditable('comment', row, editable),
        filterable: false,
        editor: TextEditor,
      },
    ].filter(Boolean);

    this.columnKeys = tableColumns.map((t) => t.key);
    const deletable = columns.length > 1;
    const isChoosePrimaryKey = columns[selectedRowIndex]?.primaryKey;
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
            {editable && (
              <>
                <WorkspaceAcess action={actionTypes.create}>
                  <ToolbarButton
                    text={<FormattedMessage id="workspace.header.create" />}
                    icon={PlusOutlined}
                    onClick={this.handleAddColumn}
                  />
                </WorkspaceAcess>

                <WorkspaceAcess action={actionTypes.update}>
                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.session.button.edit" />}
                    icon={EditOutlined}
                    disabled={
                      (isChoosePrimaryKey && enablePrimaryKeyEditor) || selectedRowIndex === -1
                    }
                    onClick={this.handleEditColumn}
                  />
                </WorkspaceAcess>

                <WorkspaceAcess action={actionTypes.delete}>
                  <ToolbarButton
                    disabled={!deletable}
                    text={<FormattedMessage id="workspace.tree.table.delete" />}
                    icon={DeleteOutlined}
                    onClick={this.handleDeleteColumn}
                  />
                </WorkspaceAcess>
              </>
            )}
            {allowRefresh && (
              <ToolbarButton
                text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                icon={<SyncOutlined />}
                onClick={this.handleRefreshColumn}
              />
            )}
          </Toolbar>
          <EditableTable
            minHeight={tableHeight || '200px'}
            columns={tableColumns}
            enableFilterRow
            rows={columns}
            rowKey={'key'}
            readonly={!editable}
            enableRowRecord={enableRowRecord}
            enableColumnRecord={false}
            enableSortRow={false}
            onSelectChange={(keys) => {
              const idx = columns.findIndex((c) => keys.includes(c.key));
              this.setState({ selectedRowIndex: idx });
            }}
            onRowsChange={this.onUpdate}
            gridRef={(ref) => {
              onCreated?.(ref);
            }}
          />
        </div>
        {fixedFooter ? (
          <>
            <div className={styles.footer}>{this.renderButtons()}</div>
          </>
        ) : (
          <>
            {editable && <Divider className={styles.divider} />}
            {this.renderButtons()}
          </>
        )}
      </>
    );
  }

  private renderButtons() {
    const { editable, modified, allowReset, onReset } = this.props;

    return (
      editable && (
        <>
          {allowReset && (
            <Button
              disabled={!modified}
              size="small"
              onClick={onReset}
              className={styles.submitButton}
              style={{
                marginRight: 8,
              }}
            >
              <FormattedMessage id="app.button.cancel" />
            </Button>
          )}

          <Button
            disabled={!modified}
            size="small"
            onClick={this.handleSubmit}
            type="primary"
            className={styles.submitButton}
          >
            <FormattedMessage id="app.button.ok" />
          </Button>
        </>
      )
    );
  }
}
