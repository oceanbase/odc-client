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

import { EXPORT_CONTENT, TaskType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';
import { Form, Radio } from 'antd';
import { FormInstance } from 'antd/es/form';
import React from 'react';
import DatabaseSelect from '../../../../component/DatabaseSelect';
import ExportSelecter from '../ExportSelecter';

const FormItem = Form.Item;

interface IProps {
  form: FormInstance<any>;
  projectId: number;
  database: IDatabase;
}

const ObjSelecterPanel: React.FC<IProps> = function ({ form, projectId, database }) {
  const connection = database?.dataSource;
  const databaseId = database?.id;
  const connectionId = connection?.id;

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
          defaultMessage: '导出内容',
        })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.ExportDrawer.ExportForm.SelectExportContent',
              defaultMessage: '请选择导出内容',
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
              defaultMessage: '导出结构和数据',
            })}
          </Radio.Button>
          <Radio.Button value={EXPORT_CONTENT.DATA}>
            {formatMessage({
              id: 'odc.ExportDrawer.ExportForm.ExportDataOnly',
              defaultMessage: '仅导出数据',
            })}
          </Radio.Button>
          <Radio.Button value={EXPORT_CONTENT.STRUCT}>
            {formatMessage({
              id: 'odc.ExportDrawer.ExportForm.ExportStructureOnly',
              defaultMessage: '仅导出结构',
            })}
          </Radio.Button>
        </Radio.Group>
      </FormItem>
      <DatabaseSelect type={TaskType.EXPORT} projectId={projectId} onChange={handleChange} />
      <FormItem
        label={
          formatMessage({
            id: 'odc.ExportForm.ObjSelecterPanel.ExportRange',
            defaultMessage: '导出范围',
          }) //导出范围
        }
        name="exportAllObjects"
        required
      >
        <Radio.Group>
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.ExportForm.ObjSelecterPanel.PartialExport',
                defaultMessage: '部分导出',
              })
              /*部分导出*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.ExportForm.ObjSelecterPanel.ExportTheEntireLibrary',
                defaultMessage: '整库导出',
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
                  defaultMessage: '导出对象',
                })}
                /*导出对象*/
              >
                <ExportSelecter
                  onlyTable={exportContent === EXPORT_CONTENT.DATA}
                  databaseId={databaseId}
                  connectionId={connectionId}
                  dialectType={connection?.dialectType}
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
