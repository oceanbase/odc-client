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
                        defaultMessage: '跳过首行',
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
                      defaultMessage: '空字符串转为空值',
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
                          defaultMessage: '字段分隔符',
                        })}
                      </span>
                    }
                    name="columnSeparator"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterAFieldDelimiter',
                          defaultMessage: '请填写字段分隔符',
                        }),
                      },

                      {
                        max: 1,
                        message: formatMessage({
                          id: 'odc.ImportForm.formitem.CsvFormItem.YouCanEnterOnlyOne',
                          defaultMessage: '只能输入一个字符',
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
                          defaultMessage: '文本识别符',
                        })}
                      </span>
                    }
                    name="columnDelimiter"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterATextIdentifier',
                          defaultMessage: '请填写文本识别符',
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
                          defaultMessage: '换行符号',
                        })}
                      </span>
                    }
                    name="lineSeparator"
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.EnterALineBreakSymbol',
                          defaultMessage: '请填写换行符号',
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
