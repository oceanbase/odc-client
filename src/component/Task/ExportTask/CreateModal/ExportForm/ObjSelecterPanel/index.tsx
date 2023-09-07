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

import { EXPORT_CONTENT, IConnection, TaskType } from '@/d.ts';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Form, Radio } from 'antd';
import { FormInstance } from 'antd/es/form';
import React, { useEffect } from 'react';
import DatabaseSelect from '../../../../component/DatabaseSelect';
import ExportSelecter from '../ExportSelecter';

const FormItem = Form.Item;

interface IProps {
  form: FormInstance<any>;
  projectId: number;
  onConnectionChange: (data: IConnection) => void;
}

const ObjSelecterPanel: React.FC<IProps> = function ({ form, projectId, onConnectionChange }) {
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const connectionId = connection?.id;

  useEffect(() => {
    if (connection) {
      onConnectionChange(connection);
    }
  }, [connection]);

  const handleChange = () => {
    form.setFieldsValue({
      exportDbObjects: [],
    });
  };

  return (
    <>
      <FormItem
        name="exportContent"
        label={formatMessage({
          id: 'odc.ExportDrawer.ExportForm.ExportContent',
        })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.ExportDrawer.ExportForm.SelectExportContent',
            }),
          },
        ]}
      >
        <Radio.Group
          onChange={() => {
            form.setFieldsValue({
              exportDbObjects: form
                .getFieldValue('exportDbObjects')
                .filter(
                  ({ dbObjectType, objectName }: { dbObjectType: string; objectName: string }) =>
                    dbObjectType === 'TABLE' || dbObjectType === 'VIEW',
                ),
            });
          }}
        >
          <Radio.Button value={EXPORT_CONTENT.DATA_AND_STRUCT}>
            {formatMessage({
              id: 'odc.ExportDrawer.ExportForm.ExportDataStructure',
            })}
          </Radio.Button>
          <Radio.Button value={EXPORT_CONTENT.DATA}>
            {formatMessage({
              id: 'odc.ExportDrawer.ExportForm.ExportDataOnly',
            })}
          </Radio.Button>
          <Radio.Button value={EXPORT_CONTENT.STRUCT}>
            {formatMessage({
              id: 'odc.ExportDrawer.ExportForm.ExportStructureOnly',
            })}
          </Radio.Button>
        </Radio.Group>
      </FormItem>
      <DatabaseSelect type={TaskType.EXPORT} projectId={projectId} onChange={handleChange} />
      <FormItem
        label={
          formatMessage({ id: 'odc.ExportForm.ObjSelecterPanel.ExportRange' }) //导出范围
        }
        name="exportAllObjects"
        required
      >
        <Radio.Group>
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.ExportForm.ObjSelecterPanel.PartialExport',
              })
              /*部分导出*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.ExportForm.ObjSelecterPanel.ExportTheEntireLibrary',
              })
              /*整库导出*/
            }
          </Radio>
        </Radio.Group>
      </FormItem>
      <FormItem noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const exportContent = getFieldValue('exportContent');
          const exportAllObjects = getFieldValue('exportAllObjects');
          if (exportAllObjects) {
            return null;
          }
          return (
            <>
              <FormItem
                requiredMark={false}
                name="exportDbObjects"
                label={formatMessage({
                  id: 'odc.ExportForm.ObjSelecterPanel.ExportObjects',
                })}
                /*导出对象*/
              >
                <ExportSelecter
                  onlyTable={exportContent === EXPORT_CONTENT.DATA}
                  databaseId={databaseId}
                  connectionId={connectionId}
                />
              </FormItem>
            </>
          );
        }}
      </FormItem>
    </>
  );
};

export default ObjSelecterPanel;
