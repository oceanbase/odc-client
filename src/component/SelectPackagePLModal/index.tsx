import { formatMessage } from '@/util/intl';
import { Form, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

const { Option } = Select;

interface IProps {
  plList: any;
  visible: boolean;
  onCancel: () => void;
  onSave: (data: any) => void;
}

@inject('pageStore')
@observer
class SelectPackagePLModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = () => {
    const { onSave, plList } = this.props;
    this.formRef.current
      .validateFields()
      .then((data) => {
        const targetPL = plList.find((pl) => pl.key === data.plKey);
        onSave(targetPL);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel, plList } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const initialValues = {
      plKey: plList?.[0]?.key,
    };

    if (!plList || !plList.length) {
      return null;
    }

    return (
      <Modal
        centered
        width={600}
        destroyOnClose
        title={formatMessage({
          id: 'odc.component.SelectPackagePLModal.SelectPlObject',
        })}
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form {...formItemLayout} hideRequiredMark initialValues={initialValues} ref={this.formRef}>
          <Form.Item
            name="plKey"
            label={formatMessage({
              id: 'odc.component.SelectPackagePLModal.PlObject',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createPackage.packageName.required',
                }),
              },
            ]}
          >
            <Select>
              {plList.map((pl) => (
                <Option value={pl.key}>{pl.plName}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default SelectPackagePLModal;
