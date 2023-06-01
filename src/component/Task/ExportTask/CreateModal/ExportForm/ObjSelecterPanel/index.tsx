import { EXPORT_CONTENT } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { Form, Radio, Select } from 'antd';
import { FormInstance } from 'antd/es/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ExportSelecter from '../ExportSelecter';

const FormItem = Form.Item;

interface IProps {
  form: FormInstance<any>;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
}

const ObjSelecterPanel: React.FC<IProps> = function ({ form, schemaStore, connectionStore }) {
  const connectionName = connectionStore.connection?.name;
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
      <FormItem
        label={formatMessage({
          id: 'odc.ExportDrawer.ExportForm.Database.1',
        })}
        /*所属库*/ name="databaseName"
        required
        extra={
          formatMessage(
            {
              id: 'odc.ExportForm.ObjSelecterPanel.CurrentConnectionConnectionname',
            },
            { connectionName: connectionName },
          ) //`当前连接: ${connectionName}`
        }
      >
        <Select
          style={{ width: 320 }}
          onChange={() => {
            form.setFieldsValue({
              exportDbObjects: [],
            });
          }}
          options={schemaStore?.databases?.map((item) => {
            return {
              label:
                item.name === schemaStore.database.name
                  ? formatMessage(
                      {
                        id: 'odc.ExportDrawer.ExportForm.ItemnameDefaultCurrentLibrary',
                      },

                      { itemName: item.name },
                    )
                  : //`${item.name} (默认当前库)`
                    item.name,
              value: item.name,
            };
          })}
        />
      </FormItem>
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
          const databaseName = getFieldValue('databaseName');
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
                  databaseName={databaseName}
                />
              </FormItem>
            </>
          );
        }}
      </FormItem>
    </>
  );
};

export default inject('connectionStore', 'schemaStore')(observer(ObjSelecterPanel));
