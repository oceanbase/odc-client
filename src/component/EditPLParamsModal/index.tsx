import { formatMessage } from '@/util/intl';
import React, { Component } from 'react';
// compatible
import { ConnectionMode } from '@/d.ts';
import { Form, FormInstance, FormProps, Modal, Table } from 'antd';

import styles from './index.less';
import ValueInput, { ValueList } from './ValueInput';

interface IProps extends FormProps {
  connectionMode?: ConnectionMode;
  plSchema?: any;
  executeLoading?: boolean;
  onSave: (values: any) => void;
  visible: boolean;
  onCancel: () => void;
}

class EditPLParamasModal extends Component<IProps> {
  state = {
    loading: false,
  };
  form = React.createRef<FormInstance<any>>();
  public handleSubmit = async () => {
    const { plSchema } = this.props;
    this.setState({
      loading: true,
    });
    const values = await this.form.current?.validateFields?.();
    if (!values) {
      return;
    }
    try {
      // 入参数更新 paramMode 为 IN params
      plSchema.params = plSchema.params.map((item) => {
        const { paramName } = item;
        if (typeof values[paramName] !== 'undefined') {
          const v = values[paramName];
          switch (v) {
            case ValueList.NULL: {
              item.defaultValue = null;
              break;
            }
            case ValueList.DEFAULT: {
              item.defaultValue = item.originDefaultValue;
              break;
            }
            default: {
              item.defaultValue = values[paramName];
            }
          }
        }
        return item;
      });
      await this.props.onSave(plSchema);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  public getColumns() {
    return [
      {
        title: '',
        dataIndex: 'index',
        key: 'index',
        width: 36,
        render(_, __, index) {
          return index + 1;
        },
      },
      {
        title: formatMessage({
          id: 'odc.component.EditPLParamsModal.Parameter',
        }),
        width: 160,
        dataIndex: 'paramName',
        key: 'paramName',
      },

      {
        title: formatMessage({
          id: 'odc.component.EditPLParamsModal.DataType',
        }),
        width: 136,
        dataIndex: 'dataType',
        key: 'dataType',
      },

      {
        title: formatMessage({ id: 'odc.component.EditPLParamsModal.Value' }),
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        render(value: any, record: any) {
          return (
            <Form.Item
              name={record.paramName}
              initialValue={value}
              // rules={[
              //   {
              //     required: true,
              //     message: formatMessage({
              //       id: 'odc.component.EditPLParamsModal.ItCannotBeEmpty',
              //     }),
              //   },
              // ]}
            >
              <ValueInput connectionMode={this.props.connectionMode} />
            </Form.Item>
          );
        },
      },
    ];
  }

  public render() {
    const { visible, onCancel, plSchema } = this.props;
    const { loading } = this.state;
    if (!plSchema) {
      return null;
    }
    const { params = [] } = plSchema;
    const columns = this.getColumns();
    const dataSource = params.filter(
      (param) => param.paramMode && /IN/.test(param.paramMode.toUpperCase()),
    );

    return (
      <Modal
        zIndex={1002}
        destroyOnClose
        title={formatMessage({
          id: 'odc.component.EditPLParamsModal.SetParameters',
        })}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={loading}
      >
        <div className={styles.table}>
          <Form ref={this.form} layout="inline">
            <Table
              size="small"
              rowKey="paramName"
              bordered={true}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Form>
        </div>
      </Modal>
    );
  }
}

export default EditPLParamasModal;
