import { isReadonlyPublicConnection } from '@/component/Acess';
import FormItemPanel from '@/component/FormItemPanel';
import SysFormItem from '@/component/SysFormItem';
import TaskTimer from '@/component/Task/component/TimerSelect';
import appConfig from '@/constant/appConfig';
import { EXPORT_CONTENT, IMPORT_TYPE } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { useUpdate } from 'ahooks';
import { Form, FormInstance, Radio, Select } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import CsvMapping from '../../csvMapping';
import CsvProvider from '../CsvProvider';
import StructDataFormItem from '../formitem/StructDataFormItem';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  form: FormInstance<any>;
  isSingleImport?: boolean;
}

const FileSelecterPanel: React.FC<IProps> = function ({
  schemaStore,
  connectionStore,
  form,
  isSingleImport,
}) {
  const { connection } = connectionStore;
  const { name } = connection;
  const update = useUpdate();

  const [tables, setTables] = useState([]);
  async function fetchTable(dbName: string) {
    const tables = await schemaStore.getTableListByDatabaseName(dbName);
    setTables(tables);
  }
  useEffect(() => {
    const dbName = form.getFieldValue('databaseName');
    if (!dbName) {
      return;
    }
    fetchTable(dbName);
  }, [form.getFieldValue('databaseName')]);

  return (
    <>
      <FormItem noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const isZipFileType = getFieldValue('fileType') == IMPORT_TYPE.ZIP;
          const isCsvFileType = getFieldValue('fileType') == IMPORT_TYPE.CSV;
          const isSQLFileType = getFieldValue('fileType') == IMPORT_TYPE.SQL;
          const importFileName = getFieldValue('importFileName');
          const importContent = getFieldValue('importContent');
          const transferData = importContent !== EXPORT_CONTENT.STRUCT;
          const isReadonlyPublicConn = isReadonlyPublicConnection(connection);
          const { containsData, containsSchema } = importFileName?.[0]?.response?.data || {};
          return (
            <>
              <FormItem
                label={formatMessage({
                  id: 'odc.ImportDrawer.ImportForm.ImportContent',
                })}
                name="importContent"
                style={{ display: isZipFileType ? 'block' : 'none' }}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.SelectImportContent',
                    }),
                  },
                ]}
              >
                <Radio.Group>
                  <Radio.Button
                    disabled={!containsData || !containsSchema}
                    value={EXPORT_CONTENT.DATA_AND_STRUCT}
                  >
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.ImportStructuresAndData',
                    })}
                  </Radio.Button>
                  <Radio.Button disabled={!containsData} value={EXPORT_CONTENT.DATA}>
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.ImportDataOnly',
                    })}
                  </Radio.Button>
                  <Radio.Button disabled={!containsSchema} value={EXPORT_CONTENT.STRUCT}>
                    {formatMessage({
                      id: 'odc.ImportDrawer.ImportForm.ImportStructureOnly',
                    })}
                  </Radio.Button>
                </Radio.Group>
              </FormItem>
              <FormItem
                label={formatMessage({
                  id: 'odc.ImportDrawer.ImportForm.Database.1',
                })}
                /*所属库*/ name="databaseName"
                required
                extra={
                  formatMessage(
                    {
                      id: 'odc.ImportForm.ConfigPanel.CurrentConnectionName',
                    },

                    { name: name },
                  )
                  //`当前连接: ${name}`
                }
              >
                <Select
                  style={{ width: 320 }}
                  onChange={() => {
                    update();
                  }}
                  options={schemaStore?.databases?.map((item) => {
                    return {
                      label:
                        item.name === schemaStore.database.name
                          ? formatMessage(
                              {
                                id: 'odc.ImportDrawer.ImportForm.ItemnameDefaultCurrentLibrary',
                              },

                              { itemName: item.name },
                            )
                          : //`${item.name} (默认当前库)`
                            item.name,
                      value: item.name,
                    };
                  })}
                />
              </FormItem>
              {(isCsvFileType || isSingleImport) && (
                <FormItem
                  required={isCsvFileType}
                  label={
                    formatMessage({
                      id: 'odc.ImportForm.ConfigPanel.ImportTargetTable',
                    })
                    //导入目标表
                  }
                  name="tableName"
                  rules={[
                    {
                      required: isCsvFileType,
                      message: formatMessage({
                        id: 'odc.ImportForm.ConfigPanel.TheImportTargetTableCannot',
                      }),
                      //导入目标表不能为空
                    },
                  ]}
                >
                  <Select
                    style={{ width: 320 }}
                    allowClear={!isCsvFileType}
                    showSearch
                    options={tables?.map((item) => {
                      return {
                        label: item.tableName,
                        value: item.tableName,
                      };
                    })}
                  />
                </FormItem>
              )}

              {isCsvFileType && (
                <CsvProvider.Consumer>
                  {(v) => {
                    return (
                      <CsvMapping
                        csvColumnMappings={v.csvColumnMappings}
                        onChangeCsvColumnMappings={v.onChangeCsvColumnMappings}
                        tableName={getFieldValue('tableName')}
                        csvMappingErrors={v.csvMappingErrors}
                      />
                    );
                  }}
                </CsvProvider.Consumer>
              )}

              <StructDataFormItem />
              <FormItemPanel
                label={formatMessage({
                  id: 'odc.ImportForm.ConfigPanel.TaskSettings',
                })}
                /*任务设置*/ keepExpand
              >
                {((!isSQLFileType && transferData) || isReadonlyPublicConn) && (
                  <>
                    {!isSQLFileType && transferData && (
                      <FormItem
                        requiredMark={false}
                        label={formatMessage({
                          id: 'odc.ImportDrawer.ImportForm.TaskErrorHandling',
                        })}
                        /* 任务错误处理 */ name="stopWhenError"
                      >
                        <Radio.Group>
                          <Radio value>
                            {
                              formatMessage({
                                id: 'odc.ImportDrawer.ImportForm.StopATask',
                              })

                              /* 停止任务 */
                            }
                          </Radio>
                          <Radio value={false}>
                            {
                              formatMessage({
                                id: 'odc.ImportDrawer.ImportForm.IgnoreErrorsContinueTasks',
                              })

                              /* 忽略错误继续任务 */
                            }
                          </Radio>
                        </Radio.Group>
                      </FormItem>
                    )}
                  </>
                )}

                <TaskTimer />
              </FormItemPanel>
            </>
          );
        }}
      </FormItem>
      {appConfig.connection.sys && appConfig.task.sys && (
        <SysFormItem
          tip={(useSys: boolean, existSys: boolean, enforce: boolean) => {
            if (!useSys) {
              return '';
            } else if (existSys) {
              return formatMessage({
                id: 'odc.ImportForm.ConfigPanel.TheAccountConfiguredForThe',
              });
              //默认使用连接设置的账号，若连接失败，建议修改密码用于此次导入
            } else {
              return formatMessage({
                id: 'odc.ImportForm.ConfigPanel.PleaseConfigureTheSysTenant',
              });
              //请配置 sys 租户账号，该账号信息仅用于此次导入
            }
          }}
          randomKey={Math.random()}
          form={form}
        />
      )}
    </>
  );
};

export default inject('schemaStore', 'connectionStore')(observer(FileSelecterPanel));
