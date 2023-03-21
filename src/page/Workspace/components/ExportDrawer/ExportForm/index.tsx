import { formatMessage } from '@/util/intl';
import React, { forwardRef, useImperativeHandle } from 'react';

import { ExportFormData } from '@/d.ts';
// compatible
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
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
  connectionStore?: ConnectionStore;
  schemaStore?: SchemaStore;
  modalStore?: ModalStore;
  formData: ExportFormData;
  ref?: React.Ref<{ valid: (callback: any) => void }>;
  onFormValueChange: any;
  formType: FormType;
}

const ExportForm: React.FC<IExportFormProps> = inject(
  'connectionStore',
  'schemaStore',
  'modalStore',
)(
  observer(
    forwardRef(function (props, ref) {
      const {
        connectionStore: { connection },
        formData,
        formType,
        onFormValueChange,
      } = props;
      const [form] = useForm<ExportFormData>();

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
        return { valid };
      });
      function renderFormItem() {
        switch (formType) {
          case FormType.ObjSelecter: {
            return <ObjSelecterPanel form={form} />;
          }
          case FormType.Config: {
            return <ConfigPanel form={form} />;
          }
          default: {
            return null;
          }
        }
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
