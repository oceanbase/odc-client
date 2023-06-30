import HelpDoc from '@/component/helpDoc';
import { IMPORT_TYPE } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Checkbox, Col, Form, Row, Select } from 'antd';
import React from 'react';
const { Option } = Select;

const FormItem = Form.Item;

interface IProps {}

const CsvFormItem: React.FC<IProps> = function (props) {
  return (
    <FormItem noStyle shouldUpdate>
      {({ getFieldValue }) => {
        const isShowCsvConfig = getFieldValue('fileType') === IMPORT_TYPE.CSV;
        return (
          isShowCsvConfig && (
            <>
              <Row>
                <FormItem
                  style={{ display: 'inline-block', marginBottom: 8 }}
                  name="skipHeader"
                  valuePropName="checked"
                >
                  <Checkbox>
                    {
                      formatMessage({
                        id: 'odc.ImportForm.formitem.CsvFormItem.SkipTheFirstRow',
                      }) /*跳过首行*/
                    }

                    <HelpDoc doc="importTaskSkipHeader" />
                  </Checkbox>
                </FormItem>
                <FormItem
                  style={{
                    display: 'inline-block',
                    marginBottom: 8,
                    marginLeft: 8,
                  }}
                  name="blankToNull"
                  valuePropName="checked"
                >
                  <Checkbox>
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.ConvertAnEmptyStringTo',
                    })}
                  </Checkbox>
                </FormItem>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <FormItem
                    style={{ marginBottom: 8 }}
                    label={
                      <span>
                        {formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.FieldSeparator',
                        })}
                      </span>
                    }
                    name="columnSeparator"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterAFieldDelimiter',
                        }),
                      },

                      {
                        max: 1,
                        message: formatMessage({
                          id: 'odc.ImportForm.formitem.CsvFormItem.YouCanEnterOnlyOne',
                        }), // 只能输入一个字符
                      },
                    ]}
                  >
                    <AutoComplete
                      options={[';', ':', ','].map((value) => {
                        return { value };
                      })}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    style={{ marginBottom: 8 }}
                    label={
                      <span>
                        {formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.TextRecognizer',
                        })}
                      </span>
                    }
                    name="columnDelimiter"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterATextIdentifier',
                        }),
                      },
                    ]}
                  >
                    <Select>
                      <Option key='"' value='"'>
                        "
                      </Option>
                      <Option key="'" value="'">
                        '
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    style={{ marginBottom: 8 }}
                    label={
                      <span>
                        {formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.LineBreakSymbol',
                        })}
                      </span>
                    }
                    name="lineSeparator"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterALineBreakSymbol',
                        }),
                      },
                    ]}
                  >
                    <Select>
                      <Option key="\\n" value="\\n">
                        \n
                      </Option>
                      <Option key="\\r" value="\\r">
                        \r
                      </Option>
                      <Option key="\\r\\n" value="\\r\\n">
                        \r\n
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </>
          )
        );
      }}
    </FormItem>
  );
};

export default CsvFormItem;
