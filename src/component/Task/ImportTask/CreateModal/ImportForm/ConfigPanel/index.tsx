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

import { getTableListByDatabaseName } from '@/common/network/table';
import { isReadonlyPublicConnection } from '@/component/Acess';
import FormItemPanel from '@/component/FormItemPanel';
import SysFormItem from '@/component/SysFormItem';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import TaskTimer from '@/component/Task/component/TimerSelect';
import { ConnectionMode, EXPORT_CONTENT, IMPORT_TYPE, TaskType } from '@/d.ts';
import odc from '@/plugins/odc';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Form, FormInstance, Radio, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import DatabaseSelect from '../../../../component/DatabaseSelect';
import CsvMapping from '../../csvMapping';
import CsvProvider from '../CsvProvider';
import StructDataFormItem from '../formitem/StructDataFormItem';

const FormItem = Form.Item;

interface IProps {
  form: FormInstance<any>;
  isSingleImport?: boolean;
  projectId: number;
  onSessionChange: (value: { sessionId: string; databaseName: string }) => void;
}

const FileSelecterPanel: React.FC<IProps> = function ({
  form,
  isSingleImport,
  projectId,
  onSessionChange,
}) {
  const [tables, setTables] = useState([]);
  const databaseId = Form.useWatch('databaseId', form);
  const { session, database } = useDBSession(databaseId);
  const connection = database?.dataSource;
  const databaseName = database?.name;
  const dataTypes = session?.dataTypes ?? [];
  const isOracle = connection?.dialectType === ConnectionMode.OB_ORACLE;
  async function fetchTable(dbName: string) {
    const tables = await getTableListByDatabaseName(session?.sessionId, dbName);
    setTables(tables);
  }
  useEffect(() => {
    if (!databaseName) {
      return;
    }
    onSessionChange({
      sessionId: session?.sessionId,
      databaseName,
    });
    fetchTable(databaseName);
  }, [databaseName]);

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
              <DatabaseSelect type={TaskType.IMPORT} projectId={projectId} />
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
                        databaseName={databaseName}
                        sessionId={session?.sessionId}
                      />
                    );
                  }}
                </CsvProvider.Consumer>
              )}

              <StructDataFormItem isOracle={isOracle} dataTypes={dataTypes} />
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

                <TaskTimer isReadonlyPublicConn={isReadonlyPublicConn} />
              </FormItemPanel>
            </>
          );
        }}
      </FormItem>
      {odc.appConfig.connection.sys && odc.appConfig.task.sys && (
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
          connection={connection}
          form={form}
        />
      )}
      <DescriptionInput />
    </>
  );
};

export default FileSelecterPanel;
