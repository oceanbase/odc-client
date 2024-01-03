/*
 * Copyright 2024 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isReadonlyPublicConnection } from '@/component/Acess';
import { formatMessage } from '@/util/intl';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { ExportFormData, IConnection } from '@/d.ts';
// compatible
import { Form, message } from 'antd';
import { inject, observer } from 'mobx-react';

import { ModalStore } from '@/store/modal';

import { useForm } from 'antd/es/form/Form';
import ConfigPanel from './ConfigPanel';
import ObjSelecterPanel from './ObjSelecterPanel';
import { useRequest } from 'ahooks';
import { getDatabase } from '@/common/network/database';

export enum FormType {
  ObjSelecter,
  Config,
}
interface IExportFormProps {
  modalStore?: ModalStore;
  formData: ExportFormData;
  projectId: number;
  ref?: React.Ref<{ valid: (callback: any) => void }>;
  onFormValueChange: any;
  formType: FormType;
}

const ExportForm: React.FC<IExportFormProps> = inject('modalStore')(
  observer(
    forwardRef(function (props, ref) {
      const { formData, formType, onFormValueChange, projectId } = props;
      const [form] = useForm<ExportFormData>();
      const databaseId = Form.useWatch('databaseId', form);
      const { data, run } = useRequest(getDatabase, {
        manual: true
      })
      const database = data?.data;
      const connection = database?.dataSource;
      const connectionId = connection?.id;
      const isReadonlyPublicConn = isReadonlyPublicConnection(connection);


      useEffect(() => {
        if (databaseId) {
          run(databaseId);
        }
      }, [databaseId]);

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
            return (
              <ObjSelecterPanel
                form={form}
                projectId={projectId}
                database={database}
              />
            );
          }
          case FormType.Config: {
            return (
              <ConfigPanel
                form={form}
                isReadonlyPublicConn={isReadonlyPublicConn}
                connection={connection}
              />
            );
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
