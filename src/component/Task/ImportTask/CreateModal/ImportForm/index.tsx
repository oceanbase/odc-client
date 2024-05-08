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

import { formatMessage } from '@/util/intl';
import React, { forwardRef, useContext, useImperativeHandle } from 'react';

import {
  CsvColumnMapping,
  EXPORT_CONTENT,
  ImportFormData,
  IMPORT_CONTENT,
  IMPORT_TYPE,
} from '@/d.ts';
// compatible
import type { ModalStore } from '@/store/modal';
import { Form, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import ConfigPanel from './ConfigPanel';
import FileSelecterPanel from './FileSelecterPanel';
import FormConfigContext from './FormConfigContext';
import FormContext from './FormContext';

interface IImportFormProps {
  formType: 'fileSelecter' | 'config';
  modalStore?: ModalStore;
  projectId: number;
  formData: ImportFormData;
  onChangeCsvColumnMappings: (csvColumnMappings: CsvColumnMapping[]) => void;
  onFormValueChange: (values: any) => void;
  ref?: React.Ref<{ valid: (callback: (haveError, values) => void) => void }>;
  resolveTableColumnsToCsv: (tableName: string) => Promise<void>;
  onSessionChange: (value: { sessionId: string; databaseName: string }) => void;
}

const ImportForm: React.FC<IImportFormProps> = inject('modalStore')(
  observer(
    forwardRef(function (props, ref) {
      const { modalStore, formData, formType, projectId, onFormValueChange, onSessionChange } =
        props;
      const [form] = useForm();
      const formConfigContext = useContext(FormConfigContext);
      const isSingleImport = !!modalStore.importModalData;

      async function valid(callback: (haveError, values) => void) {
        const values = await form.validateFields();
        if (
          values.importFileName?.find((file) => {
            console.log(file);
            return file?.status === 'uploading';
          })
        ) {
          message.warning(
            formatMessage({ id: 'odc.ImportDrawer.ImportForm.FileUploading' }), //文件上传中
          );
          return;
        }
        callback(false, values);
      }

      useImperativeHandle(ref, () => {
        return { valid };
      });

      function renderFormItem() {
        switch (formType) {
          case 'fileSelecter': {
            return <FileSelecterPanel isSingleImport={isSingleImport} form={form} />;
          }
          case 'config': {
            return (
              <ConfigPanel
                onSessionChange={onSessionChange}
                isSingleImport={isSingleImport}
                form={form}
                projectId={projectId}
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
          form={form}
          layout="vertical"
          requiredMark={'optional'}
          preserve={false}
          scrollToFirstError
          initialValues={formData}
          onValuesChange={(changedValues, allValues) => {
            const newValues: any = {};
            if (typeof changedValues.replaceSchemaWhenExists !== 'undefined') {
              /**
               * 转换结构已存在的数据格式
               */
              newValues.truncateTableBeforeImport = changedValues.replaceSchemaWhenExists;
            }
            if ('databaseName' in changedValues) {
              newValues.tableName = null;
              props.resolveTableColumnsToCsv(null);
            } else if ('tableName' in changedValues) {
              props.resolveTableColumnsToCsv(changedValues.tableName);
            }
            if (
              [
                'columnSeparator',
                'skipHeader',
                'blankToNull',
                'columnDelimiter',
                'lineSeparator',
                'importFileName',
                'encoding',
              ].find((key) => {
                return key in changedValues;
              })
            ) {
              /**
               * 修改csv设置的时候，需要清空历史的映射数据，触发下一步的时候更新csv
               */
              props.onChangeCsvColumnMappings([]);
            }
            if (changedValues.importContent) {
              if (changedValues.importContent === EXPORT_CONTENT.DATA) {
                newValues.replaceSchemaWhenExists = false;
              } else {
                newValues.replaceSchemaWhenExists =
                  formConfigContext.dfaultConfig?.replaceSchemaWhenExists ?? false;
              }
              newValues.truncateTableBeforeImport =
                formConfigContext.dfaultConfig?.truncateTableBeforeImport ?? false;
            }
            if (changedValues.fileType) {
              newValues.importFileName = [];
              /**
               * CSV 格式只能导入数据，其他情况，单表默认为导入数据，批量为导入数据+结构
               */
              if (changedValues.fileType == IMPORT_TYPE.CSV) {
                newValues.importContent = IMPORT_CONTENT.DATA;
                props.onChangeCsvColumnMappings([]);
              } else {
                newValues.importContent = modalStore.importModalData?.table
                  ? IMPORT_CONTENT.DATA
                  : IMPORT_CONTENT.DATA_AND_STRUCT;
              }
            }
            form.setFieldsValue(newValues);
            onFormValueChange({
              ...changedValues,
              ...newValues,
            });
          }}
        >
          <FormContext.Provider
            value={{
              updateFormData(newValues) {
                form.setFieldsValue(newValues);
                onFormValueChange(newValues);
              },
            }}
          >
            {renderFormItem()}
          </FormContext.Provider>
        </Form>
      );
    }),
  ),
);

export default ImportForm;
