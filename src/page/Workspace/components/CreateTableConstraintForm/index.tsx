import {
  ConnectionMode,
  ConstraintAction,
  ConstraintDelayConfig,
  ConstraintType,
  ITable,
  ITableColumn,
  ITableConstraint,
} from '@/d.ts';
import { DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Divider, Tabs, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { formatMessage, FormattedMessage } from 'umi';

import { actionTypes, WorkspaceAcess } from '@/component/Acess';
import Toolbar from '@/component/Toolbar';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { generateUniqKey } from '@/util/utils';
import { RowsChangeData } from '@alipay/ob-react-data-grid/lib/types';
import memoizeOne from 'memoize-one';
import EditableTable from '../EditableTable';
import { WrapSelectEditor } from '../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import CheckboxFormatter, { ReadonlyCheckBoxFormatter } from './CheckboxFormatter';
import { isConstaintSupportDisable } from './helper';
import styles from './index.less';
const { TabPane } = Tabs;
const ToolbarButton = Toolbar.Button;
interface IProps {
  connectionStore?: ConnectionStore;
  schemaStore?: SchemaStore;
  constraintsTab: ConstraintType;
  connectionMode: ConnectionMode;
  hideBorder?: boolean;
  fixedFooter?: boolean;
  modified: boolean;
  tableHeight?: string;
  allowCreate?: boolean;
  allowRefresh?: boolean;
  allowReset?: boolean;
  disableForeign?: boolean;
  constraints: Array<Partial<ITableConstraint>>;
  columns: Array<Partial<ITableColumn>>;
  onAddConstraint: (constraint: Partial<ITableConstraint>) => void;
  onDeleteConstraint: (rowIdx: number[]) => void;
  onCancelDeleteConstraint?: (rowIdx: number) => void;
  onSave: () => void;
  onRefresh?: () => void;
  onStartEditConstraint: (rowIdx: number) => void;
  onReset?: () => void;
  onUpdate: (newRows: ITableConstraint[], data: RowsChangeData<any, any>) => void;
  onModified: () => void;
  onConstraintsTabChanged: (tabKey: ConstraintType) => void;
}
@inject('schemaStore', 'connectionStore')
@observer
export default class CreateTableConstraintForm extends Component<
  IProps,
  {
    selectedRowIndex: number[];
    showEditModal: boolean;
    enableEdit: boolean;
    databaseName: string;
    refTables: ITable[]; // 当前可编辑表格中用户选择的关联表

    refColumns: ITableColumn[];
    primaryRequired: boolean;
    uniqueRequired: boolean;
    foreignRequired: boolean;
    checkRequired: boolean;
  }
> {
  public readonly state = {
    selectedRowIndex: [],
    showEditModal: false,
    enableEdit: false,
    databaseName: '',
    refTables: [],
    refColumns: [],
    primaryRequired: false,
    uniqueRequired: false,
    foreignRequired: false,
    checkRequired: false,
  };
  public columnKeys: string[] = [];
  private WrapSelectMemo = memoizeOne((columns) => {
    return WrapSelectEditor(columns?.map((c) => c.columnName).filter(Boolean));
  });
  private RefColumnsEditorMemo = memoizeOne((columns) => {
    return WrapSelectEditor(columns?.map((c) => c.columnName).filter(Boolean));
  });

  private RefTableEditorMemo = memoizeOne((tables) => {
    return WrapSelectEditor(
      tables?.map((c) => c.tableName),
      false,
    );
  });

  private RefDatabaseEditorMemo = memoizeOne((databases) => {
    return WrapSelectEditor(
      databases?.map((c) => c.name),
      false,
    );
  });
  public handleSubmit = () => {
    const { constraintsTab } = this.props;

    if (constraintsTab === ConstraintType.PRIMARY) {
      this.setState({
        primaryRequired: true,
      });
    }

    if (constraintsTab === ConstraintType.UNIQUE) {
      this.setState({
        uniqueRequired: true,
      });
    }

    if (constraintsTab === ConstraintType.FOREIGN) {
      this.setState({
        foreignRequired: true,
      });
    }

    if (constraintsTab === ConstraintType.CHECK) {
      this.setState({
        checkRequired: true,
      });
    }

    this.props.onSave();
  };
  public handleAddColumn = () => {
    const { constraintsTab, connectionMode } = this.props;
    let defaultConstraint: ITableConstraint;

    if (constraintsTab === ConstraintType.UNIQUE) {
      defaultConstraint = {
        name: '',
        type: ConstraintType.UNIQUE,
        columns: [],
      };
    } else if (constraintsTab === ConstraintType.PRIMARY) {
      defaultConstraint = {
        name: '',
        type: ConstraintType.PRIMARY,
        columns: [],
      };
    } else if (constraintsTab === ConstraintType.FOREIGN) {
      defaultConstraint = {
        name: '',
        type: ConstraintType.FOREIGN,
        columns: [],
        refDatabase: '',
        refTable: '',
        refColumns: [],
        deleteAction: ConstraintAction.CASCADE,
        updateAction: ConstraintAction.CASCADE,
      };
    } else {
      defaultConstraint = {
        name: '',
        type: ConstraintType.CHECK,
        condition: '',
      };
    } // Oracle 模式特殊处理

    if (connectionMode === ConnectionMode.OB_ORACLE) {
      defaultConstraint.enable = true;
      defaultConstraint.delayConfig = ConstraintDelayConfig.NOT_DEFERRABLE;

      if (constraintsTab === ConstraintType.FOREIGN) {
        defaultConstraint.updateAction = ConstraintAction.NO_ACTION;
      }
    }

    this.props.onAddConstraint({
      ...defaultConstraint,
      key: generateUniqKey(),
    });
  };
  public handleEditColumn = () => {
    this.props.onStartEditConstraint(this.state.selectedRowIndex?.[0]);
  };
  public handleDeleteConstraint = () => {
    this.props.onDeleteConstraint(this.state.selectedRowIndex);
    this.setState({
      selectedRowIndex: [],
      enableEdit: false,
    });
  };
  public handleCancelDeleteColumn = () => {
    if (this.props.onCancelDeleteConstraint) {
      this.props.onCancelDeleteConstraint(this.state.selectedRowIndex?.[0]);
    }
  };
  public handleRefreshConstraint = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  };

  public onUpdate = async (
    type: ConstraintType,
    newRows: ITableConstraint[],
    data: RowsChangeData<ITableConstraint, any>,
  ) => {
    const { schemaStore, constraintsTab, constraints } = this.props;
    const { indexes, column } = data || {};
    if (indexes && column) {
      const isForeign = constraintsTab === ConstraintType.FOREIGN;
      const columnKey = column.key;
      const newRow = newRows[indexes?.[0]];
      const value = newRow?.[columnKey];
      switch (columnKey) {
        case 'refDatabase': {
          if (isForeign) {
            newRow.refTable = '';
            newRow.refColumns = [];
          }
          const refTables = await schemaStore?.getTableListByDatabaseName(value);
          this.setState({
            databaseName: value,
            refTables,
          });
          break;
        }
        case 'refTable': {
          if (isForeign) {
            newRow.refColumns = [];
          }
          const refColumns = await schemaStore?.getTableColumnList(
            value,
            false,
            this.state.databaseName,
          );
          this.setState({
            refColumns,
          });
          break;
        }
        default: {
          break;
        }
      }
    }

    this.props.onUpdate(newRows.concat(constraints.filter((c) => c.type !== type) as any), data);
  };

  private onSelectChange = (keys: React.Key[]) => {
    if (keys.length === 0) {
      this.setState({
        selectedRowIndex: [],
        enableEdit: false,
      });
    } else {
      let enableEdit = false;
      if (keys.length === 1) {
        enableEdit = this.findConstraintByRowKey(keys[0])?._created;
      }
      this.setState({
        selectedRowIndex: this.findConstraintsRowIndexByRowsKey(keys),
        enableEdit,
      });
    }
  };

  public render() {
    const {
      connectionStore: { connection },
      schemaStore,
      constraintsTab,
      connectionMode,
      hideBorder,
      fixedFooter,
      constraints,
      columns,
      allowRefresh,
      allowCreate,
      tableHeight,
      onModified,
      onConstraintsTabChanged,
      disableForeign,
    } = this.props;
    const { enableEdit, selectedRowIndex } = this.state;
    const enableDelete = constraintsTab !== ConstraintType.PRIMARY && selectedRowIndex.length; // 新建表，唯一约束支持新建，主键不支持新建，其他的需要判断数据库是否支持

    const enableCreate =
      allowCreate ||
      constraintsTab === ConstraintType.UNIQUE ||
      (schemaStore.enableConstraintModify && constraintsTab !== ConstraintType.PRIMARY);
    const delayConfigTextMap = {
      [ConstraintDelayConfig.DEFERRABLE_INITIALLY_IMMEDIATE]: formatMessage({
        id: 'workspace.window.createTable.constraint.columns.delayConfig.DEFERRABLE_INITIALLY_IMMEDIATE',
      }),
      [ConstraintDelayConfig.DEFERRABLE_INITIALLY_DEFERRED]: formatMessage({
        id: 'workspace.window.createTable.constraint.columns.delayConfig.DEFERRABLE_INITIALLY_DEFERRED',
      }),
      [ConstraintDelayConfig.NOT_DEFERRABLE]: formatMessage({
        id: 'workspace.window.createTable.constraint.columns.delayConfig.NOT_DEFERRABLE',
      }),
    }; // MySQL 模式主键名称不可编辑，Oracle 可以

    const isNameDisableEdit =
      connection.dbMode === ConnectionMode.OB_MYSQL && constraintsTab === ConstraintType.PRIMARY;
    const baseColumns = [
      {
        key: 'name',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.name',
        }),
        resizable: true,
        sortable: false,
        required: !isNameDisableEdit,
        editable: ({ _created }: { _created: boolean }) => !!_created && !isNameDisableEdit,
        editor: TextEditor,
        formatter: ({ row }) => {
          if (isNameDisableEdit) {
            return (
              <span className={styles['text-disable']}>
                {row.name ||
                  formatMessage({
                    id: 'odc.components.CreateTableConstraintForm.NotEditable',
                  })}
              </span>
            );
          }

          return row.name || '';
        },
      },
      {
        key: 'columns',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.column',
        }),
        resizable: true,
        sortable: false,
        required: true,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: this.WrapSelectMemo(columns),
        formatter: ({ row }) => (row.columns && [].concat(row.columns).join(',')) || '',
      },
    ];
    const oracleColumns = [
      {
        key: 'enable',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.enable',
        }),
        resizable: true,
        sortable: false,
        editable: false,
        formatter: isConstaintSupportDisable(constraintsTab)
          ? CheckboxFormatter
          : ReadonlyCheckBoxFormatter,
      },
      {
        key: 'delayConfig',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.delayConfig',
        }),
        resizable: true,
        sortable: false,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: WrapSelectEditor(
          Object.keys(delayConfigTextMap).map((key) => ({
            text: delayConfigTextMap[key],
            value: key,
          })),
          false,
        ),
        formatter: ({ row }) =>
          delayConfigTextMap[
            row.delayConfig || ConstraintDelayConfig.DEFERRABLE_INITIALLY_IMMEDIATE
          ] || '',
      },
    ];
    const foreignColumns = [
      {
        key: 'refDatabase',
        // 注意 Oracle 模式下 “数据库” 展示为 “schema”，这是一种约定叫法
        name:
          connectionMode === ConnectionMode.OB_ORACLE
            ? formatMessage({
                id: 'workspace.window.createTable.constraint.columns.refDatabase.oracle',
              })
            : formatMessage({
                id: 'workspace.window.createTable.constraint.columns.refDatabase',
              }),
        resizable: true,
        sortable: false,
        required: true,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: this.RefDatabaseEditorMemo(schemaStore.databases),
        width: 160,
      },
      {
        key: 'refTable',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.refTable',
        }),
        resizable: true,
        sortable: false,
        required: true,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: this.RefTableEditorMemo(this.state.refTables),
        width: 160,
      },
      {
        key: 'refColumns',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.refColumns',
        }),
        resizable: true,
        sortable: false,
        required: true,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: this.RefColumnsEditorMemo(this.state.refColumns),
        width: 160,
        formatter: ({ row }) => (row.refColumns && [].concat(row.refColumns).join(',')) || '',
      },
      {
        key: 'deleteAction',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.deleteAction',
        }),
        resizable: true,
        sortable: false,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: WrapSelectEditor(
          connectionMode === ConnectionMode.OB_ORACLE
            ? [ConstraintAction.CASCADE, ConstraintAction.NO_ACTION, ConstraintAction.SET_NULL]
            : [
                ConstraintAction.CASCADE,
                ConstraintAction.NO_ACTION,
                ConstraintAction.RESTRICT,
                ConstraintAction.SET_NULL,
              ],
          false,
        ),
      },
      {
        key: 'updateAction',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.updateAction',
        }),
        resizable: true,
        sortable: false,
        // oracle mode 不支持编辑
        editable: ({ _created }: { _created: boolean }) =>
          !!_created && connectionMode !== ConnectionMode.OB_ORACLE,
        editor: WrapSelectEditor(
          connectionMode === ConnectionMode.OB_ORACLE
            ? [ConstraintAction.CASCADE, ConstraintAction.NO_ACTION, ConstraintAction.SET_NULL]
            : [
                ConstraintAction.CASCADE,
                ConstraintAction.NO_ACTION,
                ConstraintAction.RESTRICT,
                ConstraintAction.SET_NULL,
              ],
          false,
        ),
      },
    ]; // 唯一约束

    const uniqueConstraintColumnsInOracleMode = [...baseColumns, ...oracleColumns]; // 外键约束

    const foreignConstraintColumnsInMySQLMode = [...baseColumns, ...foreignColumns];
    const foreignConstraintColumnsInOracleMode = [
      ...baseColumns,
      ...foreignColumns,
      ...oracleColumns,
    ]; // 检查约束，Oracle Mode only

    const checkConstraintColumns = [
      baseColumns[0],
      {
        key: 'condition',
        name: formatMessage({
          id: 'workspace.window.createTable.constraint.columns.condition',
        }),
        resizable: true,
        sortable: false,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: TextEditor,
      },
      ...oracleColumns,
    ];
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
            {enableCreate && (
              <WorkspaceAcess action={actionTypes.create}>
                <ToolbarButton
                  text={<FormattedMessage id="workspace.header.create" />}
                  icon={PlusOutlined}
                  onClicsk={this.handleAddColumn}
                />
              </WorkspaceAcess>
            )}

            <WorkspaceAcess action={actionTypes.update}>
              <ToolbarButton
                disabled={!enableEdit}
                text={<FormattedMessage id="workspace.window.session.button.edit" />}
                icon={<EditOutlined />}
                onClick={this.handleEditColumn}
              />
            </WorkspaceAcess>
            <WorkspaceAcess action={actionTypes.delete}>
              <ToolbarButton
                /**
                 * 不允许编辑模式下主键删除
                 */
                disabled={!enableDelete && !allowCreate}
                text={formatMessage({
                  // id: isDeleted ? 'workspace.tree.table.cancelDelete' : 'workspace.tree.table.delete',
                  id: 'workspace.tree.table.delete',
                })}
                icon={DeleteOutlined} // onClick={isDeleted ? this.handleCancelDeleteColumn : this.handleDeleteConstraint}
                onClick={this.handleDeleteConstraint}
              />
            </WorkspaceAcess>

            {allowRefresh && (
              <ToolbarButton
                text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                icon={SyncOutlined}
                onClick={this.handleRefreshConstraint}
              />
            )}
          </Toolbar>
          <Tabs
            tabPosition="left"
            defaultActiveKey={ConstraintType.PRIMARY}
            activeKey={constraintsTab}
            onChange={(tabKey) => {
              this.setState({
                enableEdit: false,
                selectedRowIndex: [],
              });
              onConstraintsTabChanged(tabKey as any);
            }}
          >
            <TabPane
              tab={formatMessage({
                id: 'workspace.window.createTable.constraint.primary',
              })}
              key={ConstraintType.PRIMARY}
            >
              <EditableTable
                minHeight={tableHeight || '200px'}
                enableFilterRow={false}
                rowKey={'key'}
                columns={
                  connectionMode === ConnectionMode.OB_MYSQL
                    ? baseColumns
                    : [...baseColumns, ...oracleColumns]
                }
                rows={constraints.filter((c) => c.type === ConstraintType.PRIMARY)}
                onSelectChange={this.onSelectChange}
                // @ts-ignore
                onRowsChange={this.onUpdate.bind(this, ConstraintType.PRIMARY)}
              />
            </TabPane>
            <TabPane
              tab={formatMessage({
                id: 'workspace.window.createTable.constraint.unique',
              })}
              key={ConstraintType.UNIQUE}
            >
              <EditableTable
                minHeight={tableHeight || '200px'}
                enableFilterRow={false}
                rowKey={'key'}
                columns={
                  connectionMode === ConnectionMode.OB_MYSQL
                    ? baseColumns
                    : uniqueConstraintColumnsInOracleMode
                }
                rows={constraints.filter((c) => c.type === ConstraintType.UNIQUE)}
                onSelectChange={this.onSelectChange}
                // @ts-ignore
                onRowsChange={this.onUpdate.bind(this, ConstraintType.UNIQUE)}
              />
            </TabPane>
            <TabPane
              tab={
                !disableForeign ? (
                  formatMessage({
                    id: 'workspace.window.createTable.constraint.foreign',
                  })
                ) : (
                  <Tooltip
                    placement="right"
                    title={formatMessage({
                      id: 'odc.components.CreateTableConstraintForm.YouCannotViewForeignKey',
                    })}
                    /*暂不支持查看外键约束*/
                  >
                    <div>
                      {formatMessage({
                        id: 'workspace.window.createTable.constraint.foreign',
                      })}
                    </div>
                  </Tooltip>
                )
              }
              key={ConstraintType.FOREIGN}
              disabled={disableForeign}
            >
              <EditableTable
                minHeight={tableHeight || '200px'}
                enableFilterRow={false}
                rowKey={'key'}
                columns={
                  connectionMode === ConnectionMode.OB_MYSQL
                    ? foreignConstraintColumnsInMySQLMode
                    : foreignConstraintColumnsInOracleMode
                }
                rows={constraints.filter((c) => c.type === ConstraintType.FOREIGN)}
                onSelectChange={this.onSelectChange}
                // @ts-ignore
                onRowsChange={this.onUpdate.bind(this, ConstraintType.FOREIGN)}
              />
            </TabPane>
            {connectionMode === ConnectionMode.OB_ORACLE && (
              <TabPane
                tab={formatMessage({
                  id: 'workspace.window.createTable.constraint.check',
                })}
                key={ConstraintType.CHECK}
              >
                <EditableTable
                  minHeight={tableHeight || '200px'}
                  enableFilterRow={false}
                  rowKey={'key'}
                  columns={checkConstraintColumns}
                  rows={constraints.filter((c) => c.type === ConstraintType.CHECK)}
                  onSelectChange={this.onSelectChange}
                  // @ts-ignore
                  onRowsChange={this.onUpdate.bind(this, ConstraintType.CHECK)}
                />
              </TabPane>
            )}
          </Tabs>
        </div>
        {fixedFooter ? (
          <>
            <div className={styles.footer}>{this.renderButtons()}</div>
          </>
        ) : (
          <>
            <Divider className={styles.divider} />
            {this.renderButtons()}
          </>
        )}
      </>
    );
  }

  private renderButtons() {
    const { allowReset, onReset, modified } = this.props;
    return (
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
    );
  }

  private findConstraintByRowKey(rowKey: React.Key): Partial<ITableConstraint> | null {
    const { constraints, constraintsTab } = this.props; // @ts-ignore

    return constraints.find((c) => c.type === constraintsTab && c.key === rowKey);
  }

  private findConstraintsRowIndexByRowsKey(rowsKey: React.Key[]): number[] {
    const { constraints, constraintsTab } = this.props; // @ts-ignore

    return constraints
      .filter((c) => c.type === constraintsTab)
      .map((c, idx) => (rowsKey.includes(c.key) ? idx : -1))
      .filter((c) => c !== -1);
  }
}
