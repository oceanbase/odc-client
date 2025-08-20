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

import { getDataSourceModeConfig } from '@/common/datasource';
import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import SysFormItem from '@/component/SysFormItem';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskExecutionMethodForm from '@/component/Task/component/TaskExecutionMethodForm';
import { ENABLED_SYS_FROM_ITEM } from '@/component/Task/helper';
import { EXPORT_CONTENT, EXPORT_TYPE, IConnection, IMPORT_ENCODING } from '@/d.ts';
import odc from '@/plugins/odc';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Checkbox, Col, Form, FormInstance, InputNumber, Row, Select } from 'antd';
import React, { useContext } from 'react';
import FormContext from '../FormContext';
import { CRLFToSeparatorString } from '@/util/utils';
import { rules } from '../../const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  form: FormInstance<any>;
  connection: IConnection;
}
const ConfigPanel: React.FC<IProps> = function ({ form, connection }) {
  const formContext = useContext(FormContext);
  const config = getDataSourceModeConfig(connection?.type);
  const exportFileMaxSizeOpt = [
    {
      value: formatMessage({
        id: 'odc.ExportForm.ConfigPanel.Unlimited',
        defaultMessage: '无限制',
      }), //无限制
    },
    {
      value: 64,
    },
    {
      value: 512,
    },
    {
      value: 1024,
    },
    {
      value: 2048,
    },
  ];

  return (
    <>
      <FormItem noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const exportContent = getFieldValue('exportContent');
          const dataTransferFormat = getFieldValue('dataTransferFormat');
          const exportData = exportContent !== EXPORT_CONTENT.STRUCT;
          const exportStruct = exportContent !== EXPORT_CONTENT.DATA;
          const onlyExportStruct = exportContent === EXPORT_CONTENT.STRUCT;
          const isCsv = dataTransferFormat === EXPORT_TYPE.CSV;
          const isSQL = dataTransferFormat === EXPORT_TYPE.SQL;
          return (
            <>
              {exportData && (
                <FormItemPanel
                  keepExpand
                  label={
                    <HelpDoc doc="exportDataConfig" leftText>
                      {
                        formatMessage({
                          id: 'odc.ExportForm.ConfigPanel.DataFileSettings',
                          defaultMessage: '数据文件设置',
                        })

                        /*数据文件设置*/
                      }
                    </HelpDoc>
                  }
                >
                  <Row gutter={24}>
                    <Col span={8}>
                      <FormItem
                        name="dataTransferFormat"
                        label={
                          formatMessage({
                            id: 'odc.ExportDrawer.ExportForm.DataFormat',
                            defaultMessage: '数据格式',
                          })

                          // 数据格式
                        }
                        rules={rules.dataTransferFormat}
                      >
                        <Select>
                          <Option key={EXPORT_TYPE.CSV} value={EXPORT_TYPE.CSV}>
                            {
                              formatMessage({
                                id: 'odc.ExportDrawer.ExportForm.CsvFormat',
                                defaultMessage: 'CSV 格式',
                              })

                              /* CSV 格式 */
                            }
                          </Option>
                          <Option key={EXPORT_TYPE.SQL} value={EXPORT_TYPE.SQL}>
                            {formatMessage({
                              id: 'odc.ExportDrawer.ExportForm.SqlFormat',
                              defaultMessage: 'SQL 格式',
                            })}
                          </Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        name="encoding"
                        label={formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.FileEncoding',
                          defaultMessage: '文件编码',
                        })}
                        rules={rules.encoding}
                      >
                        <Select>
                          {Object.entries(IMPORT_ENCODING).map(([text, value]) => {
                            return (
                              <Option value={value} key={value}>
                                {text}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                    {/* {!isClient() && (
                     <Col span={6}>
                       <MaskPolicySelecter required />
                     </Col>
                    )} */}
                    {config?.features?.export?.fileLimit && (
                      <Col span={8}>
                        <FormItem
                          style={{ marginBottom: 8 }}
                          label={
                            <span>
                              {
                                formatMessage({
                                  id: 'odc.ExportForm.ConfigPanel.MaximumSizeOfASingle',
                                  defaultMessage: '单个文件上限（MB）',
                                }) /*单个文件上限(MB)*/
                              }

                              <HelpDoc
                                {...{
                                  doc: 'exportFileMaxSize',
                                  leftText: true,
                                  isTip: true,
                                }}
                              />
                            </span>
                          }
                          name="exportFileMaxSize"
                          rules={rules.exportFileMaxSize}
                        >
                          <AutoComplete options={exportFileMaxSizeOpt} />
                        </FormItem>
                      </Col>
                    )}
                  </Row>
                  {isSQL && (
                    <FormItem
                      label={formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.SqlFileSettings',
                        defaultMessage: 'SQL 文件设置',
                      })}

                      /*SQL 文件设置*/
                    >
                      <FormItem
                        shouldUpdate
                        name="batchCommit"
                        valuePropName="checked"
                        style={{ marginBottom: 0, paddingBottom: 7 }}
                      >
                        <Checkbox
                          onChange={(v) => {
                            if (v.target.checked) {
                              form.setFieldsValue({
                                batchCommitNum: formContext?.dfaultConfig?.batchCommitNum || 100,
                              });
                            } else {
                              form.setFieldsValue({
                                batchCommitNum: null,
                              });
                            }
                          }}
                        >
                          <HelpDoc leftText isTip doc="batchCommit">
                            {formatMessage({
                              id: 'odc.ExportDrawer.ExportForm.BatchSubmissionQuantity',
                              defaultMessage: '批量提交数量',
                            })}
                          </HelpDoc>
                        </Checkbox>
                      </FormItem>
                      <FormItem noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return (
                            <FormItem
                              name="batchCommitNum"
                              shouldUpdate
                              rules={rules.batchCommitNum({
                                required: !!form.getFieldValue('batchCommit'),
                              })}
                              style={{ marginBottom: 8, width: '100%' }}
                            >
                              <InputNumber
                                disabled={!getFieldValue('batchCommit')}
                                style={{ width: '150px' }}
                                max={500}
                                min={0}
                              />
                            </FormItem>
                          );
                        }}
                      </FormItem>
                    </FormItem>
                  )}

                  {isCsv && (
                    <FormItem
                      style={{ marginBottom: 0 }}
                      label={formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.CsvSettings',
                        defaultMessage: 'CSV 设置',
                      })}
                      /*CSV 设置*/ shouldUpdate
                    >
                      <Row>
                        <FormItem
                          name="withColumnTitle"
                          valuePropName="checked"
                          style={{
                            display: 'inline-block',
                            marginBottom: 8,
                          }}
                        >
                          <Checkbox>
                            {formatMessage({
                              id: 'odc.ImportDrawer.ImportForm.ContainsColumnHeaders',
                              defaultMessage: '包含列头',
                            })}
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
                      <Row gutter={24}>
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
                    </FormItem>
                  )}

                  {config?.features?.export?.snapshot && (
                    <FormItem
                      name="globalSnapshot"
                      valuePropName="checked"
                      style={{ marginBottom: 4 }}
                    >
                      <Checkbox>
                        <HelpDoc leftText isTip doc="globalSnapshot">
                          {formatMessage({
                            id: 'odc.ExportDrawer.ExportForm.UseGlobalSnapshots',
                            defaultMessage: '使用全局快照',
                          })}
                        </HelpDoc>
                      </Checkbox>
                    </FormItem>
                  )}
                </FormItemPanel>
              )}

              {exportStruct && (
                <FormItemPanel
                  keepExpand
                  label={
                    <HelpDoc doc="exportStructConfig" leftText>
                      {
                        formatMessage({
                          id: 'odc.ExportForm.ConfigPanel.StructureFileSettings',
                          defaultMessage: '结构文件设置',
                        })

                        /*结构文件设置*/
                      }
                    </HelpDoc>
                  }
                >
                  {onlyExportStruct && (
                    <FormItem name="mergeSchemaFiles" valuePropName="checked">
                      <Checkbox>
                        {
                          formatMessage({
                            id: 'odc.ExportForm.ConfigPanel.MergeTheExportResultsInto',
                            defaultMessage: '导出结果合并为一个 SQL 文件',
                          }) /*导出结果合并为一个SQL文件*/
                        }
                      </Checkbox>
                    </FormItem>
                  )}

                  <FormItem name="withDropDDL" rules={rules.withDropDDL} valuePropName="checked">
                    <Checkbox>
                      {
                        formatMessage({
                          id: 'odc.ExportForm.ConfigPanel.AddADropStatementBefore',
                          defaultMessage: 'Create 语句前添加 Drop 语句',
                        })

                        /*Create 语句前添加 Drop 语句*/
                      }

                      <HelpDoc isTip doc="exportDropTable" />
                    </Checkbox>
                  </FormItem>
                </FormItemPanel>
              )}
            </>
          );
        }}
      </FormItem>
      <FormItemPanel
        label={formatMessage({
          id: 'odc.ExportForm.ConfigPanel.TaskSettings',
          defaultMessage: '任务设置',
        })}
        /*任务设置*/ keepExpand
      >
        <TaskExecutionMethodForm />
      </FormItemPanel>
      {ENABLED_SYS_FROM_ITEM &&
        odc.appConfig.connection.sys &&
        odc.appConfig.task.sys &&
        config?.connection?.sys && (
          <FormItem noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const exportDbObjects = getFieldValue('exportDbObjects');
              return (
                <SysFormItem
                  tip={(useSys: boolean, existSys: boolean, enforce: boolean) => {
                    if (!useSys) {
                      return formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.IfYouDoNotUse.1',
                        defaultMessage: '若不使用 sys 租户账号，导出可能缺少索引',
                      }); //若不使用 sys 租户账号，导出可能缺少索引
                    } else if (existSys) {
                      return formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.TheAccountConfiguredForThe',
                        defaultMessage:
                          '默认使用连接设置的账号，若连接失败，建议修改密码用于此次导出',
                      });

                      //默认使用连接设置的账号，若连接失败，建议修改密码用于此次导出
                    } else {
                      return formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.PleaseConfigureTheSysTenant',
                        defaultMessage: '请配置 sys 租户账号，该账号信息仅用于此次导出',
                      });

                      //请配置 sys 租户账号，该账号信息仅用于此次导出
                    }
                  }}
                  form={form}
                  randomKey={Math.random()}
                  enforce={false}
                  connection={connection}
                />
              );
            }}
          </FormItem>
        )}

      <DescriptionInput />
    </>
  );
};

export default ConfigPanel;
