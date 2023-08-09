import HelpDoc from '@/component/helpDoc';
import { IExportResultSetFileType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Checkbox, Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import styles from './index.less';

const { Option } = Select;
const FormItem = Form.Item;

interface IProps {}

export const CsvFormItemPanel: React.FC<IProps> = (props) => {
  return (
    <Form.Item noStyle shouldUpdate>
      {({ getFieldValue }) => {
        const fileFormat = getFieldValue('fileFormat');
        switch (fileFormat) {
          case IExportResultSetFileType.CSV: {
            return (
              <Form.Item label="CSV 文件设置" shouldUpdate>
                <div className={styles.inlineForm}>
                  <Row>
                    <FormItem
                      style={{ display: 'inline-block', marginBottom: 8 }}
                      name={['csvFormat', 'isContainColumnHeader']}
                      valuePropName="checked"
                    >
                      <Checkbox>包含列头</Checkbox>
                    </FormItem>
                    <FormItem
                      style={{
                        display: 'inline-block',
                        marginBottom: 8,
                        marginLeft: 8,
                      }}
                      name={['csvFormat', 'isTransferEmptyString']}
                      valuePropName="checked"
                    >
                      <Checkbox>空字符串转为空值</Checkbox>
                    </FormItem>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <FormItem
                        style={{ marginBottom: 8 }}
                        label="字段分隔符"
                        name={['csvFormat', 'columnSeparator']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: '请填写字段分隔符',
                            }),
                          },

                          {
                            max: 1,
                            message: '只能输入一个字符',
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
                        label="文本识别符"
                        name={['csvFormat', 'columnDelimiter']}
                        rules={[
                          {
                            required: true,
                            message: '请填写文本识别符',
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
                        label="换行符号"
                        name={['csvFormat', 'lineSeparator']}
                        rules={[
                          {
                            required: true,
                            message: '请填写换行符号',
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
                </div>
              </Form.Item>
            );
          }
          case IExportResultSetFileType.SQL: {
            return (
              <Form.Item label="SQL 文件设置" shouldUpdate>
                <div className={styles.inlineForm}>
                  <Row>
                    <Form.Item
                      rules={[{ required: true }]}
                      label={
                        <HelpDoc isTip leftText doc="exportTableName">
                          指定表名
                        </HelpDoc>
                      }
                      name="tableName"
                    >
                      <Input style={{ width: 320 }} />
                    </Form.Item>
                  </Row>
                </div>
              </Form.Item>
            );
          }
          case IExportResultSetFileType.EXCEL: {
            return (
              <Form.Item label="Excel 文件设置" shouldUpdate>
                <div className={styles.inlineForm}>
                  <Row>
                    <FormItem
                      style={{ display: 'inline-block', marginBottom: 8 }}
                      name={['csvFormat', 'isContainColumnHeader']}
                      valuePropName="checked"
                    >
                      <Checkbox>包含列头</Checkbox>
                    </FormItem>
                    <Form.Item
                      style={{ display: 'inline-block', marginBottom: 8 }}
                      name="saveSql"
                      valuePropName="checked"
                    >
                      <Checkbox>导出 SQL 到另一个 Sheet</Checkbox>
                    </Form.Item>
                  </Row>
                </div>
              </Form.Item>
            );
          }
          default: {
            return null;
          }
        }
      }}
    </Form.Item>
  );
};
