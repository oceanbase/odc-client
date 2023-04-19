import { getPackageCreateSQL } from '@/common/network';
import { openCreatePackagePage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';

interface IProps {
  modalStore?: ModalStore;
}

export enum CheckOption {
  NONE = 'NONE',
}

class CreatePackageModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = () => {
    const { modalStore } = this.props;
    const { sessionId, dbName } = modalStore.createPackageModalData;
    this.formRef.current
      .validateFields()
      .then(async (data) => {
        const packageName = data?.packageName;
        const sql = await getPackageCreateSQL(packageName, sessionId, dbName);
        openCreatePackagePage(sql, sessionId, dbName);
        modalStore.changeCreatePackageModalVisible(false);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { modalStore } = this.props;
    const initialValues = {
      packageName: null,
    };

    return (
      <Modal
        centered={true}
        width={600}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.createPackage.modal.title',
        })}
        visible={modalStore.createPackageModalVisible}
        okText={formatMessage({
          id: 'odc.component.CreatePackageModal.NextConfirmTheSqlStatement',
        })} /* 下一步：确认 SQL */
        onOk={this.save}
        onCancel={() => {
          modalStore.changeCreatePackageModalVisible(false);
        }}
      >
        <Form
          layout="vertical"
          requiredMark={'optional'}
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

export default inject('modalStore')(observer(CreatePackageModal));
