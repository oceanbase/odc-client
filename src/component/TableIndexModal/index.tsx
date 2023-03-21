import type { IDataType, ITableColumn, ITableIndex } from '@/d.ts';
import { IndexRange, IndexType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Modal, Radio } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';
import { FormattedMessage } from 'umi';
import TableIndexSelector from '../TableIndexSelector';

interface IProps {
  dataTypes: IDataType[];
  rangeInitialValue?: IndexRange;
  rangeDisabled: boolean;
  model: Partial<ITableIndex>;
  columns: Partial<ITableColumn>[];
  onSave: (values: ITableIndex) => void;
  visible: boolean;
  onCancel: () => void;
}

class TableIndexModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = async () => {
    const { onSave } = this.props;
    this.formRef.current
      .validateFields()
      .then((values) => {
        const data: ITableIndex = {
          ...values,
        };
        // @ts-ignore
        if (data.editType === IndexType.PRIMARY) {
          data.primaryKey = true;
          // @ts-ignore
        } else if (data.editType === IndexType.UNIQUE) {
          data.unique = true;
        } else {
          data.primaryKey = false;
          data.unique = false;
        }
        // @ts-ignore
        data.columnNames = data.columnNames.map((c) => c.columnName);
        onSave(data);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel, model, columns, dataTypes, rangeInitialValue, rangeDisabled } =
      this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    const editType = model.primaryKey
      ? IndexType.PRIMARY
      : model.unique
      ? IndexType.UNIQUE
      : IndexType.NORMAL;

    const initialValues = {
      name: model.name,
      range: model.range || rangeInitialValue,
      type: 'BTree',
      editType: editType,
      columnNames:
        model.columnNames?.map((c) => ({
          columnName: c,
        })) || [],
    };

    return (
      <Modal
        centered={true}
        width={800}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.table.modal.index.title',
        })}
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form
          {...formItemLayout}
          hideRequiredMark={true}
          initialValues={initialValues}
          ref={this.formRef}
        >
          <Form.Item
            name="name"
            label={formatMessage({
              id: 'workspace.window.createTable.index.name',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.index.name.validation',
                }),
              },
            ]}
          >
            <Input
              readOnly={!model._created}
              placeholder={formatMessage({
                id: 'workspace.window.createTable.index.name.placeholder',
              })}
            />
          </Form.Item>
          <Form.Item
            name="range"
            label={formatMessage({
              id: 'workspace.window.createTable.index.range',
            })}
          >
            <Radio.Group disabled={rangeDisabled}>
              <Radio value={IndexRange.GLOBAL}>
                <FormattedMessage id="workspace.window.createTable.index.range.global" />
              </Radio>
              <Radio value={IndexRange.LOCAL}>
                <FormattedMessage id="workspace.window.createTable.index.range.local" />
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="type"
            label={formatMessage({
              id: 'workspace.window.createTable.index.type',
            })}
          >
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item
            name="editType"
            label={formatMessage({
              id: 'workspace.window.createTable.index.editType',
            })}
          >
            <Radio.Group>
              {/* <Radio value={IndexType.PRIMARY}>
                <FormattedMessage id="workspace.window.createTable.index.editType.primary" />
              </Radio> */}
              <Radio value={IndexType.UNIQUE} key={IndexType.UNIQUE}>
                <FormattedMessage id="workspace.window.createTable.index.editType.unique" />
              </Radio>
              <Radio value={IndexType.NORMAL} key={IndexType.NORMAL}>
                <FormattedMessage id="workspace.window.createTable.index.editType.normal" />
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="columnNames"
            label={formatMessage({
              id: 'workspace.window.createTable.index.columnNames',
            })}
            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: formatMessage({
                  id: 'odc.component.TableIndexModal.TheIndexColumnMustBe',
                }), // 索引列不能为空
              },
            ]}
          >
            <TableIndexSelector dataTypes={dataTypes} columns={columns} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default TableIndexModal;
