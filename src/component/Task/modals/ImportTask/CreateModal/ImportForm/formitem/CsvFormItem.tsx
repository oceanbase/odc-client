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
import { CRLFToSeparatorString } from '@/util/utils';
import { AutoComplete, Checkbox, Col, Form, Row, Select } from 'antd';
import React from 'react';
import { rules } from '../../const';
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
                    rules={rules.columnSeparator}
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
                    rules={rules.columnDelimiter}
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
                    rules={rules.lineSeparator}
                    getValueProps={(value) => ({
                      value: CRLFToSeparatorString(value),
                    })}
                  >
                    <Select>
                      <Option key="\n" value="\n">
                        \n
                      </Option>
                      <Option key="\r" value="\r">
                        \r
                      </Option>
                      <Option key="\r\n" value="\r\n">
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
