import React, { Component } from 'react';
import { formatMessage, FormattedMessage } from 'umi';

import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';

import { IPartitionType, ITable, ITablePartition } from '@/d.ts';
import { Alert, Button, Divider, Form, Input, InputNumber, message } from 'antd';
// @ts-ignore
import Toolbar from '@/component/Toolbar';
import { generateUniqKey } from '@/util/utils';
import { RowsChangeData } from '@alipay/ob-react-data-grid/lib/types';
import { partitionNameMap } from '../CreateTablePartitionRuleForm';
import EditableTable from '../EditableTable';
import { TextEditor } from '../EditableTable/Editors/TextEditor';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

interface IProps {
  tableHeight?: string;
  allowRefresh?: boolean;
  fixedFooter?: boolean;
  modified: boolean;
  partitions: ITable['partitions'];
  onAddPartition: (key: string) => void;
  onDeletePartition: (rowIdx: number) => void;
  onCancelDeletePartition: (rowIdx: number) => void;
  onSave: () => void;
  onRefresh: () => void;
  onReset: () => void;
  onUpdate: (newRows: ITablePartition[], data: RowsChangeData<ITablePartition, any>) => void;
}

export function getTitleByPartType(partType: IPartitionType | undefined): string {
  if (partType === IPartitionType.RANGE || partType === IPartitionType.RANGE_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.range',
    });
  } else if (partType === IPartitionType.LIST || partType === IPartitionType.LIST_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.list',
    });
  }
  return '';
}

export default class CreateTablePartitionForm extends Component<
  IProps,
  {
    selectedRowIndex: number;
    showEditModal: boolean;
    isDeleted: boolean;
  }
> {
  public readonly state = {
    selectedRowIndex: 0,
    showEditModal: false,
    isDeleted: false,
  };

  public columnKeys: string[] = [];

  public handleSubmit = () => {
    this.props.onSave();
  };

  public handleAddColumn = () => {
    this.props.onAddPartition(generateUniqKey());
  };

  public handleDeleteColumn = () => {
    // 至少需要保留一个分区
    const _deletedNum = this.props.partitions.filter((p) => p._deleted).length;
    if (_deletedNum === this.props.partitions.length - 1) {
      message.error(
        formatMessage({
          id: 'workspace.window.createTable.partition.delete.check',
        }),
      );
      return;
    }

    this.setState({
      isDeleted: !this.state.isDeleted,
    });

    this.props.onDeletePartition(this.state.selectedRowIndex);
  };

  public handleCancelDeleteColumn = () => {
    this.setState({
      isDeleted: !this.state.isDeleted,
    });

    this.props.onCancelDeletePartition(this.state.selectedRowIndex);
  };

  public handleRefreshColumn = () => {
    this.props.onRefresh();
  };

  public handleClickRow = (index: number) => {
    const { partitions } = this.props;
    if (partitions[index]) {
      const isDeleted = !!partitions[index]._deleted;
      this.setState({
        selectedRowIndex: index,
        isDeleted,
      });
    }
  };

  public handleSelect = (keys: React.Key[]) => {
    const { partitions } = this.props;
    const rowIdx = partitions.findIndex((p) => keys.includes(p.key));
    if (partitions[rowIdx]) {
      const isDeleted = !!partitions[rowIdx]._deleted;
      this.setState({
        selectedRowIndex: rowIdx,
        isDeleted,
      });
    }
  };

  public render() {
    const { partitions, allowRefresh, tableHeight, fixedFooter } = this.props;
    const { partType, expression, partNumber } = partitions[0];

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };

    const tableColumns = [
      {
        key: 'partName',
        name: formatMessage({
          id: 'workspace.window.createTable.partition.name',
        }),
        resizable: true,
        sortable: false,
        editable: false,
      },

      {
        key: 'position',
        name: formatMessage({
          id: 'workspace.window.createTable.partition.position',
        }),
        resizable: true,
        sortable: false,
        width: 110,
        editable: false,
      },

      {
        key: 'partType',
        name: formatMessage({
          id: 'workspace.window.createTable.partition.type',
        }),
        resizable: true,
        sortable: false,
        formatter: ({ row }) => partitionNameMap[row.partType] || '',
        editable: false,
      },

      {
        key: 'expression',
        name: formatMessage({
          id: 'workspace.window.createTable.partition.expression',
        }),
        resizable: true,
        sortable: false,
      },

      {
        key: 'partValues',
        name: getTitleByPartType(partType),
        resizable: true,
        sortable: false,
        editable: ({ _created }: { _created: boolean }) => !!_created,
        editor: TextEditor,
      },
    ];

    this.columnKeys = tableColumns.map((t) => t.key);
    /**
     * aone/issue/40235549
     */
    const isPartitionValid = !partitions?.find((p) => !p.positionValid);
    return (
      <>
        {partType === IPartitionType.HASH || this.isKeyPartType(partType) ? (
          <>
            {!isPartitionValid && (
              <Alert
                style={{ marginBottom: 12 }}
                message={formatMessage({
                  id: 'odc.components.CreateTablePartitionForm.ThePartitionOrderOfThe',
                })} /*当前版本的 OB 的分区顺序显示可能存在异常，请查看 DDL 进行确认*/
                type="info"
              />
            )}

            <Form {...formItemLayout} className={styles.form}>
              <Form.Item
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.type',
                })}
              >
                <Input
                  style={{ width: 240 }}
                  value={(partType && partitionNameMap[partType]) || partType}
                  disabled={true}
                />
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.expression',
                })}
              >
                <Input style={{ width: 240 }} value={expression} disabled={true} />
              </Form.Item>
              <Form.Item
                label={formatMessage({
                  id: 'workspace.window.createTable.partition.partNumber',
                })}
              >
                <InputNumber value={partNumber} disabled={true} />
              </Form.Item>
            </Form>
          </>
        ) : (
          <>
            <div className={styles.container}>
              <Toolbar>
                <ToolbarButton
                  text={<FormattedMessage id="workspace.header.create" />}
                  icon={<PlusOutlined />}
                  onClick={this.handleAddColumn}
                />

                <ToolbarButton
                  text={formatMessage({ id: 'workspace.tree.table.delete' })}
                  icon={<DeleteOutlined />}
                  onClick={this.handleDeleteColumn}
                />

                {allowRefresh && (
                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                    icon={<SyncOutlined />}
                    onClick={this.handleRefreshColumn}
                  />
                )}
              </Toolbar>
              {!isPartitionValid && (
                <Alert
                  closable
                  showIcon
                  message={formatMessage({
                    id: 'odc.components.CreateTablePartitionForm.ThePartitionOrderOfThe',
                  })} /*当前版本的 OB 的分区顺序显示可能存在异常，请查看 DDL 进行确认*/
                  type="info"
                />
              )}

              <div style={{ flexGrow: 1, paddingBottom: 40 }}>
                <EditableTable
                  minHeight={'100%'}
                  rowKey={'key'}
                  columns={tableColumns}
                  rows={partitions}
                  onRowClick={this.handleClickRow}
                  onSelectChange={this.handleSelect}
                  // @ts-ignore
                  onRowsChange={this.props.onUpdate}
                />
              </div>
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
        )}
      </>
    );
  }

  private renderButtons() {
    const { onReset, modified } = this.props;
    return (
      <>
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

  private isKeyPartType(partType: IPartitionType | undefined): boolean {
    // 数据库会加上标识，类似 KEY_V2 的情况
    return (
      !!partType && (partType === IPartitionType.KEY || partType.startsWith(IPartitionType.KEY))
    );
  }
}
