import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react'; // compatible
import React, { Component } from 'react';

import { IConnectionLabel } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Form, Input, Radio, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import styles from './index.less';

interface IProps {
  connectionStore?: ConnectionStore;
  label?: IConnectionLabel;
  labelsDOM: HTMLElement;
  onCancel: () => void;
  onOK: (value: any, label?: any) => void; // todo change 内容变更时，将内容传递出去
}

@inject('connectionStore')
@observer
class LabelForm extends Component<IProps> {
  private formRef = React.createRef<FormInstance>();

  private handleConfirm = async () => {
    const { label, onOK, labelsDOM } = this.props;
    this.formRef.current
      .validateFields()
      .then((values) => {
        onOK(values, label?.id);
        this.handleCancel();
        labelsDOM.scrollTo(0, 0);
      })
      .catch((errorInfo) => {
        throw new Error({ ...errorInfo });
      });
  };

  private handleCancel = () => {
    this.props.onCancel();
  };

  private handleLabelRepeat = async (ruler, value) => {
    const labelColor = this.formRef.current.getFieldValue('labelColor');
    const {
      connectionStore: { labels },
    } = this.props;
    if (labels?.find((item) => item.labelName === value && item.labelColor === labelColor)) {
      throw new Error();
    }
  };

  public render() {
    const { label = {} } = this.props;
    const { labelName = '', labelColor = 'color1' } = label as IConnectionLabel;
    return (
      <Form
        ref={this.formRef}
        layout="inline"
        className={styles.labelFrom}
        initialValues={{
          labelName,
          labelColor,
        }}
      >
        <Form.Item
          name="labelName"
          rules={[
            {
              whitespace: true,
              required: true,
              message: formatMessage({
                id: 'odc.components.LabelForm.EnterATag',
              }), // 请输入标签
            },
            {
              max: 12,
              message: formatMessage({
                id: 'odc.components.LabelForm.LabelIsTooLong',
              }),
            },
            {
              validator: this.handleLabelRepeat,
              message: formatMessage({
                id: 'odc.components.LabelForm.DuplicateTags',
              }), // 标签重复
            },
          ]}
        >
          <Input className={styles.input} />
        </Form.Item>
        <Form.Item name="labelColor">
          <Radio.Group className={styles.colors}>
            <Radio.Button value="color1" className={styles.color1} />
            <Radio.Button value="color2" className={styles.color2} />
            <Radio.Button value="color3" className={styles.color3} />
            <Radio.Button value="color4" className={styles.color4} />
            <Radio.Button value="color5" className={styles.color5} />
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Space className={styles.operator}>
            <CheckOutlined
              style={{
                color: '#52c41a',
                fontSize: '14px',
              }}
              onClick={this.handleConfirm}
            />

            <CloseOutlined
              style={{
                color: '#ff4d4f',
                fontSize: '14px',
              }}
              onClick={this.handleCancel}
            />
          </Space>
        </Form.Item>
      </Form>
    );
  }
}

export default LabelForm;
