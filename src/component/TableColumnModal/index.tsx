import { ConnectionMode, ITableColumn } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { isSupportAutoIncrement } from '@/util/utils';
import { AutoComplete, Checkbox, Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  model: Partial<ITableColumn>;
  onSave: (values: ITableColumn, isCreated: boolean) => void;
  visible: boolean;
  onCancel: () => void;
}

@inject('schemaStore', 'connectionStore')
@observer
class TableColumnModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = () => {
    const { onSave, model } = this.props;

    this.formRef.current
      .validateFields()
      .then((data) => {
        // 翻转，需要展示“非空”而非“允许空值”
        data.allowNull = !data.allowNull;

        onSave(data, !!(model && model._created));
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel, model, schemaStore, connectionStore } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    let dataTypes;
    if (schemaStore) {
      dataTypes = schemaStore.dataTypes;
    }

    let dbMode;
    if (connectionStore) {
      dbMode = connectionStore.connection && connectionStore.connection.dbMode;
    }

    const initialValues = {
      columnName: model.columnName,
      dataType: this.wrapDataType(model.dataType),
      allowNull: !model.allowNull,
      comment: model.comment,
      defaultValue: model.defaultValue,
      autoIncreament: model.autoIncreament,
    };

    return (
      <Modal
        destroyOnClose={true}
        title={formatMessage({
          id: model._created
            ? 'workspace.window.table.modal.column.title.create'
            : 'workspace.window.table.modal.column.title',
        })}
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form {...formItemLayout} initialValues={initialValues} ref={this.formRef}>
          <Form.Item
            name="columnName"
            label={formatMessage({
              id: 'workspace.window.createTable.column.name',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.column.name.validation',
                }),
              },
            ]}
          >
            <Input
              readOnly={!model._created}
              placeholder={formatMessage({
                id: 'workspace.window.createTable.column.name.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="dataType"
            label={formatMessage({
              id: 'workspace.window.createTable.column.dataType',
            })}
            style={{ marginBottom: 16 }}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.column.dataType.required',
                }),
              },
              {
                validator: this.handleValidateDataType,
                message: formatMessage({
                  id: 'workspace.window.createTable.column.dataType.length',
                }),
              },
            ]}
          >
            <AutoComplete
              options={
                dataTypes && dataTypes.map((d) => d.databaseType).map((value) => ({ value }))
              }
              filterOption={(inputValue, option) =>
                option.value.toString().toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
          <Form.Item
            name="allowNull"
            style={{ marginBottom: 16 }}
            label={formatMessage({
              id: 'workspace.window.createTable.column.allowNull',
            })}
            valuePropName="checked"
          >
            <Checkbox disabled={!!model?.initialValue?.allowNull} />
          </Form.Item>
          {dbMode !== ConnectionMode.OB_ORACLE && (
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const dataType = getFieldValue('dataType');
                return (
                  <Form.Item
                    name="autoIncreament"
                    valuePropName="checked"
                    style={{ marginBottom: 16 }}
                    label={formatMessage({
                      id: 'workspace.window.createTable.column.increment',
                    })}
                  >
                    <Checkbox disabled={!isSupportAutoIncrement(dataType)} />
                  </Form.Item>
                );
              }}
            </Form.Item>
          )}
          <Form.Item
            name="defaultValue"
            label={formatMessage({
              id: 'workspace.window.createTable.column.defaultValue',
            })}
          >
            <Input
              placeholder={formatMessage({
                id: 'workspace.window.createTable.column.defaultValue.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="comment"
            label={formatMessage({
              id: 'workspace.window.createTable.column.comment',
            })}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder={formatMessage({
                id: 'workspace.window.createTable.column.comment.placeholder',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  private wrapDataType(dataType: string | undefined = '') {
    const { model } = this.props;

    if (model.length) {
      return `${dataType}(${model.length})`;
    } else {
      return dataType;
    }
  }

  private async handleValidateDataType(rule: any, value: string, callback: any) {
    const parenStart = value.indexOf('(');
    const parenEnd = value.indexOf(')');
    // 校验包含长度的数据类型
    if (parenStart > -1 && parenEnd > -1 && parenStart === parenEnd - 1) {
      throw new Error();
    }
  }
}

export default TableColumnModal;
