import type { IPackage, IView } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';

interface IProps {
  model: Partial<IPackage>;
  onSave: (values: IView) => void;
  visible: boolean;
  onCancel: () => void;
}

export enum CheckOption {
  NONE = 'NONE',
}

class CreatePackageModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = () => {
    const { onSave } = this.props;
    this.formRef.current
      .validateFields()
      .then((data) => {
        onSave(data);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel, model } = this.props;
    const initialValues = {
      packageName: model.packageName,
    };

    return (
      <Modal
        centered={true}
        width={600}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.createPackage.modal.title',
        })}
        visible={visible}
        okText={formatMessage({
          id: 'odc.component.CreatePackageModal.NextConfirmTheSqlStatement',
        })} /* 下一步：确认 SQL */
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form
          layout="vertical"
          hideRequiredMark={true}
          initialValues={initialValues}
          ref={this.formRef}
        >
          <Form.Item
            name="packageName"
            label={formatMessage({
              id: 'workspace.window.createPackage.packageName',
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
            <Input
              // eslint-disable-next-line
              autoComplete={'off'}
              placeholder={formatMessage({
                id: 'workspace.window.createPackage.packageName.placeholder',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default CreatePackageModal;
