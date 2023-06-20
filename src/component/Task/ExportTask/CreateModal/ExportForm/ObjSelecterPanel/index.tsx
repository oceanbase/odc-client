import { EXPORT_CONTENT, IConnection } from '@/d.ts';
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
  onConnectionChange: (data: IConnection) => void;
}

const ObjSelecterPanel: React.FC<IProps> = function ({ form, onConnectionChange }) {
  const databaseId = Form.useWatch('databaseId', form);
  const { database } = useDBSession(databaseId);
  const databaseName = database?.name;
  const connection = database?.dataSource;
  const connectionId = connection?.id;

  useEffect(() => {
    if (connection) {
      onConnectionChange(connection);
    }
  }, [connection]);

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
      <DatabaseSelect />
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
                  databaseName={databaseName}
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
