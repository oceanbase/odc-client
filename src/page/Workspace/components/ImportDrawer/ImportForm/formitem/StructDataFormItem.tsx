import DataTypeSelect from '@/component/DataTypeSelect';
import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import { FILE_DATA_TYPE, IMPORT_CONTENT, IMPORT_TYPE } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Checkbox, Col, Form, InputNumber, Radio, Row } from 'antd';
import React from 'react';

const FormItem = Form.Item;

interface IProps {}

const StructDataFormItem: React.FC<IProps> = function (props) {
  return (
    <FormItem noStyle shouldUpdate>
      {({ getFieldValue }) => {
        const importContent = getFieldValue('importContent');
        const isSQLFile = getFieldValue('fileType') === IMPORT_TYPE.SQL;
        const isCsvFile = getFieldValue('fileType') === IMPORT_TYPE.CSV;
        const replaceSchemaWhenExists = getFieldValue('replaceSchemaWhenExists');
        if (isSQLFile) {
          return null;
        }
        return (
          <>
            {(importContent !== IMPORT_CONTENT.STRUCT || isCsvFile) && (
              <FormItemPanel
                label={formatMessage({
                  id: 'odc.ImportDrawer.ImportForm.ImportDataSettings',
                })}
                keepExpand
                overview={
                  <Row>
                    <FormItem
                      style={{ marginBottom: 4 }}
                      name="truncateTableBeforeImport"
                      valuePropName="checked"
                    >
                      <Checkbox
                        style={{
                          color: replaceSchemaWhenExists ? 'rgba(0, 0, 0, 0.45)' : 'unset',
                        }}
                        disabled={replaceSchemaWhenExists}
                      >
                        <HelpDoc leftText isTip doc="truncateTableBeforeImport">
                          {formatMessage({
                            id: 'odc.ImportDrawer.ImportForm.ClearDataBeforeImport',
                          })}
                        </HelpDoc>
                      </Checkbox>
                    </FormItem>
                  </Row>
                }
              >
                <Row gutter={18}>
                  <Col span={10}>
                    <Row>
                      <FormItem
                        label={
                          <HelpDoc leftText isTip doc="batchCommitNum">
                            {formatMessage({
                              id: 'odc.ImportDrawer.ImportForm.BatchSubmissionQuantity',
                            })}
                          </HelpDoc>
                        }
                        name="batchCommitNum"
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'odc.ImportDrawer.ImportForm.EnterTheNumberOfBatch',
                            }),
                          },
                        ]}
                        style={{ marginBottom: 8, width: '100%' }}
                      >
                        <InputNumber style={{ width: '100%' }} max={500} min={0} />
                      </FormItem>
                    </Row>
                  </Col>
                  <Col span={14}>
                    <FormItem noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const showSkipDataTypes =
                          getFieldValue('dataTransferFormat') === FILE_DATA_TYPE.CSV ||
                          getFieldValue('fileType') === IMPORT_TYPE.CSV;
                        return (
                          showSkipDataTypes && (
                            <FormItem
                              name="skippedDataType"
                              label={
                                <span style={{ color: 'var(--text-color-primary)' }}>
                                  {formatMessage({
                                    id: 'odc.ImportDrawer.ImportForm.DataTypeSkipped',
                                  })}
                                </span>
                              }
                            >
                              <DataTypeSelect />
                            </FormItem>
                          )
                        );
                      }}
                    </FormItem>
                  </Col>
                </Row>
              </FormItemPanel>
            )}

            {importContent !== IMPORT_CONTENT.DATA && (
              <FormItem
                label={
                  <HelpDoc leftText isTip doc="existAction">
                    {
                      formatMessage({
                        id: 'odc.ImportForm.formitem.StructDataFormItem.ImportStructureSettingsWhenThe',
                      }) /* 导入结构设置：结构已存在时 */
                    }
                  </HelpDoc>
                }
                requiredMark={false}
                name="replaceSchemaWhenExists"
              >
                <Radio.Group>
                  <Radio value={false}>
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.Skip',
                    })}
                  </Radio>
                  <Radio value>
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.Replacement',
                    })}
                  </Radio>
                </Radio.Group>
              </FormItem>
            )}
          </>
        );
      }}
    </FormItem>
  );
};

export default StructDataFormItem;
