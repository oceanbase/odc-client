import FormItemPanel from '@/component/FormItemPanel';
import HelpDoc from '@/component/helpDoc';
import MaskPolicySelecter from '@/component/MaskPolicySelecter';
import SysFormItem from '@/component/SysFormItem';
import TaskTimer from '@/component/Task/component/TimerSelect';
import appConfig from '@/constant/appConfig';
import { EXPORT_CONTENT, EXPORT_TYPE, IConnection, IMPORT_ENCODING } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Checkbox, Col, Form, FormInstance, InputNumber, Row, Select } from 'antd';
import React, { useContext } from 'react';
import FormContext from '../FormContext';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  form: FormInstance<any>;
  isReadonlyPublicConn: boolean;
  connection: IConnection;
}
const ConfigPanel: React.FC<IProps> = function ({ form, isReadonlyPublicConn, connection }) {
  const formContext = useContext(FormContext);
  const exportFileMaxSizeOpt = [
    {
      value: formatMessage({ id: 'odc.ExportForm.ConfigPanel.Unlimited' }), //无限制
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

  const validator = (_, value) => {
    if (
      value === formatMessage({ id: 'odc.ExportForm.ConfigPanel.Unlimited' }) //无限制
    ) {
      return Promise.resolve();
    } else {
      // 当value不为'无限制'时，它的类型可能为string或者number。
      const size = parseInt(value);
      // 当value为011时，它可以转换为整数，但不是我们想要的参数形式，所以使用转换前后的长度来进行比较。
      if (Number.isNaN(size) || size.toString().length !== value.toString().length) {
        return Promise.reject(
          new Error(
            formatMessage({ id: 'odc.ExportForm.ConfigPanel.SelectUnlimitedOrEnterA' }), //请选择"无限制"或者输入0 < size <= 2048范围内的正整数
          ),
        );
      }
      if (size > 0 && size <= 2048) {
        return Promise.resolve();
      } else {
        return Promise.reject(
          new Error(
            formatMessage({ id: 'odc.ExportForm.ConfigPanel.SetTheUpperLimitOf' }), //请将单个文件上限设定为0 < size <= 2048范围内的正整数
          ),
        );
      }
    }
  };
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
                        })

                        /*数据文件设置*/
                      }
                    </HelpDoc>
                  }
                >
                  <Row>
                    <Col span={6}>
                      <FormItem
                        name="dataTransferFormat"
                        label={
                          formatMessage({
                            id: 'odc.ExportDrawer.ExportForm.DataFormat',
                          })

                          // 数据格式
                        }
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'odc.ExportDrawer.ExportForm.SelectExportFormat',
                            }),
                          },
                        ]}
                      >
                        <Select style={{ width: 152 }}>
                          <Option key={EXPORT_TYPE.CSV} value={EXPORT_TYPE.CSV}>
                            {
                              formatMessage({
                                id: 'odc.ExportDrawer.ExportForm.CsvFormat',
                              })

                              /* CSV 格式 */
                            }
                          </Option>
                          <Option key={EXPORT_TYPE.SQL} value={EXPORT_TYPE.SQL}>
                            {formatMessage({
                              id: 'odc.ExportDrawer.ExportForm.SqlFormat',
                            })}
                          </Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem
                        name="encoding"
                        label={formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.FileEncoding',
                        })}
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'odc.ImportDrawer.ImportForm.SelectAFileEncoding',
                            }),
                          },
                        ]}
                      >
                        <Select style={{ width: 152 }}>
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
                    {!isClient() && (
                      <Col span={6}>
                        <MaskPolicySelecter required />
                      </Col>
                    )}

                    <Col span={6}>
                      <FormItem
                        style={{ marginBottom: 8 }}
                        label={
                          <span>
                            {
                              formatMessage({
                                id: 'odc.ExportForm.ConfigPanel.MaximumSizeOfASingle',
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
                        rules={[
                          {
                            required: true,
                            message: formatMessage({
                              id: 'odc.ExportForm.ConfigPanel.PleaseFillInOrSelect',
                            }), //请填写或者选择单个文件上限(MB)
                          },
                          () => ({
                            validator,
                          }),
                        ]}
                      >
                        <AutoComplete options={exportFileMaxSizeOpt} />
                      </FormItem>
                    </Col>
                  </Row>
                  {isSQL && (
                    <FormItem
                      label={formatMessage({
                        id: 'odc.ExportForm.ConfigPanel.SqlFileSettings',
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
                              rules={[
                                {
                                  required: !!form.getFieldValue('batchCommit'),
                                  message: formatMessage({
                                    id: 'odc.ExportDrawer.ExportForm.EnterTheNumberOfBatch',
                                  }),
                                },
                              ]}
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
                                  id: 'odc.ExportDrawer.ExportForm.YouCanEnterOnlyOne',
                                }),

                                // 只能输入一个字符
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
                    </FormItem>
                  )}

                  <FormItem
                    name="globalSnapshot"
                    valuePropName="checked"
                    style={{ marginBottom: 4 }}
                  >
                    <Checkbox>
                      <HelpDoc leftText isTip doc="globalSnapshot">
                        {formatMessage({
                          id: 'odc.ExportDrawer.ExportForm.UseGlobalSnapshots',
                        })}
                      </HelpDoc>
                    </Checkbox>
                  </FormItem>
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
                          }) /*导出结果合并为一个SQL文件*/
                        }
                      </Checkbox>
                    </FormItem>
                  )}

                  <FormItem
                    name="withDropDDL"
                    rules={[
                      {
                        required: false,
                        message: formatMessage({
                          id: 'odc.ExportDrawer.ExportForm.SelectExportContent',
                        }),
                      },
                    ]}
                    valuePropName="checked"
                  >
                    <Checkbox>
                      {
                        formatMessage({
                          id: 'odc.ExportForm.ConfigPanel.AddADropStatementBefore',
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
        label={formatMessage({ id: 'odc.ExportForm.ConfigPanel.TaskSettings' })}
        /*任务设置*/ keepExpand
      >
        <TaskTimer isReadonlyPublicConn={isReadonlyPublicConn} />
      </FormItemPanel>
      {appConfig.connection.sys && appConfig.task.sys && (
        <FormItem noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const exportDbObjects = getFieldValue('exportDbObjects');
            return (
              <SysFormItem
                tip={(useSys: boolean, existSys: boolean, enforce: boolean) => {
                  if (!useSys) {
                    return formatMessage({
                      id: 'odc.ExportForm.ConfigPanel.IfYouDoNotUse.1',
                    }); //若不使用 sys 租户账号，导出可能缺少索引
                  } else if (existSys) {
                    return formatMessage({
                      id: 'odc.ExportForm.ConfigPanel.TheAccountConfiguredForThe',
                    });

                    //默认使用连接设置的账号，若连接失败，建议修改密码用于此次导出
                  } else {
                    return formatMessage({
                      id: 'odc.ExportForm.ConfigPanel.PleaseConfigureTheSysTenant',
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
    </>
  );
};

export default ConfigPanel;
