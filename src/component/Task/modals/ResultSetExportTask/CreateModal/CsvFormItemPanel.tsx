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
import { IExportResultSetFileType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Checkbox, Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import styles from './index.less';
import { CRLFToSeparatorString } from '@/util/utils';
import { rules } from './const';
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
              <Form.Item
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.CSVFileSettings',
                    defaultMessage: 'CSV 文件设置',
                  }) /* CSV 文件设置 */
                }
                shouldUpdate
              >
                <div className={styles.inlineForm}>
                  <Row>
                    <FormItem
                      style={{
                        display: 'inline-block',
                        marginBottom: 8,
                      }}
                      name={['csvFormat', 'isContainColumnHeader']}
                      valuePropName="checked"
                    >
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.Contain',
                            defaultMessage: '包含列头',
                          }) /* 包含列头 */
                        }
                      </Checkbox>
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
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.EmptyStringTurnsToEmpty',
                            defaultMessage: '空字符串转为空值',
                          }) /* 空字符串转为空值 */
                        }
                      </Checkbox>
                    </FormItem>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <FormItem
                        style={{
                          marginBottom: 8,
                        }}
                        label={
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.FieldSeparator',
                            defaultMessage: '字段分隔符',
                          }) /* 字段分隔符 */
                        }
                        name={['csvFormat', 'columnSeparator']}
                        rules={rules['csvFormat-columnSeparator']}
                      >
                        <AutoComplete
                          options={[';', ':', ','].map((value) => {
                            return {
                              value,
                            };
                          })}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        style={{
                          marginBottom: 8,
                        }}
                        label={
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.TextRecognitionSymbol',
                            defaultMessage: '文本识别符',
                          }) /* 文本识别符 */
                        }
                        name={['csvFormat', 'columnDelimiter']}
                        rules={rules['csvFormat-columnDelimiter']}
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
                        style={{
                          marginBottom: 8,
                        }}
                        label={
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.ReplacementSymbol',
                            defaultMessage: '换行符号',
                          }) /* 换行符号 */
                        }
                        name={['csvFormat', 'lineSeparator']}
                        rules={rules['csvFormat-lineSeparator']}
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
                </div>
              </Form.Item>
            );
          }
          case IExportResultSetFileType.SQL: {
            return (
              <Form.Item
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.SQLFileSettings',
                    defaultMessage: 'SQL 文件设置',
                  }) /* SQL 文件设置 */
                }
                shouldUpdate
                required={true}
              >
                <div className={styles.inlineForm}>
                  <Row>
                    <Form.Item
                      rules={rules.tableName}
                      label={
                        <HelpDoc isTip leftText doc="exportTableName">
                          {
                            formatMessage({
                              id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.SpecifiedTableName',
                              defaultMessage: '指定表名',
                            }) /* 
                          指定表名
                          */
                          }
                        </HelpDoc>
                      }
                      name="tableName"
                    >
                      <Input
                        style={{
                          width: 320,
                        }}
                      />
                    </Form.Item>
                  </Row>
                </div>
              </Form.Item>
            );
          }
          case IExportResultSetFileType.EXCEL: {
            return (
              <Form.Item
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.ExcelFileSettings',
                    defaultMessage: 'Excel 文件设置',
                  }) /* Excel 文件设置 */
                }
                shouldUpdate
              >
                <div className={styles.inlineForm}>
                  <Row>
                    <FormItem
                      style={{
                        display: 'inline-block',
                        marginBottom: 8,
                      }}
                      name={['csvFormat', 'isContainColumnHeader']}
                      valuePropName="checked"
                    >
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.Contain.1',
                            defaultMessage: '包含列头',
                          }) /* 包含列头 */
                        }
                      </Checkbox>
                    </FormItem>
                    <Form.Item
                      style={{
                        display: 'inline-block',
                        marginBottom: 8,
                      }}
                      name="saveSql"
                      valuePropName="checked"
                    >
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.ExportSQLToAnotherSheet',
                            defaultMessage: '导出 SQL 到另一个 Sheet',
                          }) /* 导出 SQL 到另一个 Sheet */
                        }
                      </Checkbox>
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
