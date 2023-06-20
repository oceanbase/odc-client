import { isReadonlyPublicConnection } from '@/component/Acess';
import { formatMessage } from '@/util/intl';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import { ExportFormData, IConnection } from '@/d.ts';
// compatible
import { Form, message } from 'antd';
import { inject, observer } from 'mobx-react';

import { ModalStore } from '@/store/modal';

import { useForm } from 'antd/es/form/Form';
import ConfigPanel from './ConfigPanel';
import ObjSelecterPanel from './ObjSelecterPanel';

export enum FormType {
  ObjSelecter,
  Config,
}
interface IExportFormProps {
  modalStore?: ModalStore;
  formData: ExportFormData;
  ref?: React.Ref<{ valid: (callback: any) => void }>;
  onFormValueChange: any;
  formType: FormType;
}

const ExportForm: React.FC<IExportFormProps> = inject('modalStore')(
  observer(
    forwardRef(function (props, ref) {
      const { formData, formType, onFormValueChange } = props;
      const [form] = useForm<ExportFormData>();
      const [connection, setConnection] = useState<IConnection>(null);
      const isReadonlyPublicConn = isReadonlyPublicConnection(connection);

      async function valid(callback: (haveError, values) => void) {
        const values = await form.validateFields();
        if (!values) {
          return;
        }
        if (
          !values.exportDbObjects?.length &&
          formType === FormType.ObjSelecter &&
          !values.exportAllObjects
        ) {
          message.warn(
            formatMessage({
              id: 'odc.ExportDrawer.ExportForm.SelectExportObjects',
            }),
          );

          callback(true, values);
          return;
        }
        callback(false, values);
      }

      useImperativeHandle(ref, () => {
        return {
          valid,
          resetFields: form.resetFields,
        };
      });
      function renderFormItem() {
        switch (formType) {
          case FormType.ObjSelecter: {
            return <ObjSelecterPanel form={form} onConnectionChange={handleConnectionChange} />;
          }
          case FormType.Config: {
            return <ConfigPanel form={form} isReadonlyPublicConn={isReadonlyPublicConn} />;
          }
          default: {
            return null;
          }
        }
      }

      function handleConnectionChange(connection: IConnection) {
        setConnection(connection);
      }

      return (
        <Form
          layout="vertical"
          requiredMark={'optional'}
          scrollToFirstError
          initialValues={formData}
          onValuesChange={(c, values) => {
            const newValues = { ...values };
            if (c?.exportAllObjects) {
              newValues.exportDbObjects = [];
              form.setFieldsValue({
                exportDbObjects: [],
              });
            }
            onFormValueChange?.(c, newValues);
          }}
          form={form}
        >
          {renderFormItem()}
        </Form>
      );
    }),
  ),
);

export default ExportForm;
