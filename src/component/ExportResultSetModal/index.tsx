import { formatMessage } from '@/util/intl';
import React, { useEffect, useRef, useState } from 'react';
// compatible
import { exportResultSet } from '@/common/network/sql';
import HelpDoc from '@/component/helpDoc';
import MaskPolicySelecter from '@/component/MaskPolicySelecter';
import { ConnectionMode, IExportResultSetFileType, IMPORT_ENCODING } from '@/d.ts';
import connection from '@/store/connection';
import { isClient } from '@/util/env';
import { downloadFile } from '@/util/utils';
import { AutoComplete, Button, Checkbox, Col, Form, Input, message, Row, Select } from 'antd';
import { useForm } from 'antd/es/form/Form';
import Drawer from '../Drawer';
import InputBigNumber from '../InputBigNumber';
import MonacoEditor from '../MonacoEditor';
import styles from './index.less';
const { Option } = Select;
interface IProps {
  sql: string;
  visible: boolean;
  tableName: string;
  sessionId?: string;
  schemaName?: string;
  onClose: () => void;
}

const defaultCsvData = {
  isContainColumnHeader: true,
  isTransferEmptyString: true,
  columnSeparator: ',',
  columnDelimiter: '"',
  lineSeparator: '\\r\\n',
};

const FormItem = Form.Item;

const ExportResultSetModal: React.FC<IProps> = (props) => {
  const { visible, sql, tableName, sessionId, schemaName, onClose } = props;
  const [loading, setLoading] = useState(false);
  const taskInsRef = useRef<{
    stopTask: () => void;
    task: Promise<string>;
  }>();

  const [form] = useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setLoading(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      if (data) {
        const {
          fileEncoding,
          fileFormat,
          tableName,
          fileName,
          csvFormat,
          saveSql,
          maxRows,
          maskingPolicyId,
        } = data;
        setLoading(true);
        const taskIns = await exportResultSet(
          sql,
          fileName,
          fileFormat,
          fileEncoding,
          tableName,
          csvFormat,
          sessionId,
          saveSql,
          maxRows,
          maskingPolicyId,
          schemaName,
        );

        if (!taskIns) {
          return;
        }
        taskInsRef.current = taskIns;
        const fileNameUrl = await taskIns.task;
        if (!fileNameUrl) {
          return;
        }
        taskInsRef.current = null;
        downloadFile(fileNameUrl);
        message.success(
          formatMessage({
            id: 'odc.component.ExportResultSetModal.StartDownloading',
          }),
          // 文件开始下载
        );
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value: IExportResultSetFileType) => {
    switch (value) {
      case IExportResultSetFileType.SQL: {
        if (sql) {
          form.setFieldsValue({
            tableName,
          });
        }
        return;
      }
      case IExportResultSetFileType.CSV: {
        form.setFieldsValue({
          csvFormat: defaultCsvData,
        });
      }
      case IExportResultSetFileType.EXCEL: {
      }
    }
  };

  return (
    <Drawer
      width={520}
      destroyOnClose
      title={
        formatMessage({ id: 'odc.component.ExportResultSetModal.DownloadData' }) //下载数据
      }
      visible={visible}
      closable={!loading}
      onClose={() => {
        if (taskInsRef.current) {
          taskInsRef.current.stopTask();
        }
        onClose();
      }}
      footerBtns={[
        <Button
          key={'cancel'}
          onClick={() => {
            if (taskInsRef.current) {
              taskInsRef.current.stopTask();
            }
            onClose();
          }}
        >
          {
            formatMessage({
              id: 'odc.component.ExportResultSetModal.Cancel',
            }) /*取消*/
          }
        </Button>,
        <Button key={'ok'} type="primary" onClick={handleSubmit} loading={loading}>
          {formatMessage({
            id: 'odc.component.ExportResultSetModal.Download',
          })}
        </Button>,
      ]}
    >
      <Form
        initialValues={{
          fileFormat: IExportResultSetFileType.CSV,
          fileEncoding: IMPORT_ENCODING.UTF8,
          csvFormat: defaultCsvData,
          saveSql: true,
          maxRows: sessionId
            ? [...connection.subSessions.values()].find(
                (session) => session.sessionId === sessionId,
              )?.queryLimit
            : connection.queryLimit,
        }}
        layout="vertical"
        form={form}
      >
        <Form.Item
          label={
            formatMessage({ id: 'odc.component.ExportResultSetModal.QuerySql' }) //查询 SQL
          }
        >
          <div
            style={{
              height: 200,
              outline: '1px solid var(--odc-border-color)',
              position: 'relative',
            }}
          >
            <MonacoEditor
              readOnly
              defaultValue={sql}
              language={
                connection.connection.dbMode === ConnectionMode.OB_MYSQL ? 'obmysql' : 'oboracle'
              }
            />
          </div>
        </Form.Item>
        <Form.Item
          name="maxRows"
          label={formatMessage({
            id: 'odc.component.ExportResultSetModal.LimitOnTheNumberOf',
          })} /*查询结果条数限制*/
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.ExportResultSetModal.PleaseFillInTheNumber',
              }), //请填写条数限制
            },
          ]}
        >
          <InputBigNumber isInt min="1" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          name="fileName"
          label={formatMessage({
            id: 'odc.component.ExportResultSetModal.FileName',
          })}
          /* 文件名称 */
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.ExportResultSetModal.PleaseFillInTheDocument',
              }), //请填写文件名称
            },
          ]}
        >
          <Input style={{ width: 320 }} />
        </Form.Item>
        <Form.Item
          name="fileFormat"
          label={formatMessage({
            id: 'odc.component.ExportResultSetModal.FileFormat',
          })}
          /* 文件格式 */
        >
          <Select
            onChange={(v: IExportResultSetFileType) => {
              handleTypeChange(v);
            }}
            style={{ width: 200 }}
          >
            <Option value={IExportResultSetFileType.CSV}>{IExportResultSetFileType.CSV}</Option>
            <Option value={IExportResultSetFileType.SQL}>{IExportResultSetFileType.SQL}</Option>
            <Option value={IExportResultSetFileType.EXCEL}>{IExportResultSetFileType.EXCEL}</Option>
          </Select>
        </Form.Item>
        <Row>
          <Col span={11}>
            <Form.Item
              name="fileEncoding"
              label={formatMessage({
                id: 'odc.component.ExportResultSetModal.FileEncoding',
              })}
              /* 文件编码 */
            >
              <Select style={{ width: 200 }}>
                <Option value={IMPORT_ENCODING.UTF8}>{IMPORT_ENCODING.UTF8}</Option>
                <Option value={IMPORT_ENCODING.UTF16}>{IMPORT_ENCODING.UTF16}</Option>
                <Option value={IMPORT_ENCODING.GBK}>{IMPORT_ENCODING.GBK}</Option>
                <Option value={IMPORT_ENCODING.GB2312}>{IMPORT_ENCODING.GB2312}</Option>
                <Option value={IMPORT_ENCODING.BIG5}>{IMPORT_ENCODING.BIG5}</Option>
              </Select>
            </Form.Item>
          </Col>
          {!isClient() && (
            <Col span={11}>
              <MaskPolicySelecter width={200} />
            </Col>
          )}
        </Row>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const fileFormat = getFieldValue('fileFormat');
            switch (fileFormat) {
              case IExportResultSetFileType.CSV: {
                return (
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'odc.component.ExportResultSetModal.CsvFileSettings',
                      }) //CSV 文件设置
                    }
                    shouldUpdate
                  >
                    <div className={styles.inlineForm}>
                      <Row>
                        <FormItem
                          style={{ display: 'inline-block', marginBottom: 8 }}
                          name={['csvFormat', 'isContainColumnHeader']}
                          valuePropName="checked"
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
                          name={['csvFormat', 'isTransferEmptyString']}
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
                            name={['csvFormat', 'columnSeparator']}
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
                            name={['csvFormat', 'columnDelimiter']}
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
                            name={['csvFormat', 'lineSeparator']}
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
                    </div>
                  </Form.Item>
                );
              }
              case IExportResultSetFileType.SQL: {
                return (
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'odc.component.ExportResultSetModal.SqlFileSettings',
                      }) //SQL 文件设置
                    }
                    shouldUpdate
                  >
                    <div className={styles.inlineForm}>
                      <Row>
                        <Form.Item
                          label={
                            <HelpDoc isTip leftText doc="exportTableName">
                              {
                                formatMessage({
                                  id: 'odc.component.ExportResultSetModal.SpecifyATableName',
                                }) /*指定表名*/
                              }
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
                  <Form.Item
                    label={
                      formatMessage({
                        id: 'odc.component.ExportResultSetModal.ExcelFileSettings',
                      }) //Excel 文件设置
                    }
                    shouldUpdate
                  >
                    <div className={styles.inlineForm}>
                      <Row>
                        <FormItem
                          style={{ display: 'inline-block', marginBottom: 8 }}
                          name={['csvFormat', 'isContainColumnHeader']}
                          valuePropName="checked"
                        >
                          <Checkbox>
                            {formatMessage({
                              id: 'odc.ImportDrawer.ImportForm.ContainsColumnHeaders',
                            })}
                          </Checkbox>
                        </FormItem>
                        <Form.Item
                          style={{ display: 'inline-block', marginBottom: 8 }}
                          name="saveSql"
                          valuePropName="checked"
                        >
                          <Checkbox>
                            {
                              formatMessage({
                                id: 'odc.component.ExportResultSetModal.ExportSqlToAnotherSheet',
                              }) /*导出 SQL 到另一个 Sheet*/
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
      </Form>
    </Drawer>
  );
};

export default ExportResultSetModal;
