import { formatMessage } from '@/util/intl';
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

import RiskLevelLabel from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import DatabaseLabel from '../../component/DatabaseLabel';
import type { IResultSetExportTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, IExportResultSetFileType, TaskExecStrategy } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Divider } from 'antd';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
export const getItems = (
  _task: TaskDetail<IResultSetExportTaskParams>,
  result: ITaskResult,
  hasFlow: boolean,
  theme: string,
) => {
  if (!_task) {
    return [];
  }
  const taskExecStrategyMap = getTaskExecStrategyMap(_task?.type);
  const res: {
    sectionName?: string;
    textItems: [string, string | number, number?][];
    sectionRender?: (task: TaskDetail<IResultSetExportTaskParams>) => void;
  }[] = [
    {
      textItems: [],
      sectionRender: (task: TaskDetail<IResultSetExportTaskParams>) => {
        const parameters = task?.parameters;
        const riskLevel = task?.riskLevel;
        const csvFormat = [];
        if (parameters?.csvFormat?.isContainColumnHeader) {
          csvFormat.push(
            formatMessage({
              id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Contain',
              defaultMessage: '包含列头',
            }), //'包含列头'
          );
        }

        if (parameters?.csvFormat?.isTransferEmptyString) {
          csvFormat.push(
            formatMessage({
              id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.EmptyStringTurnsToEmpty',
              defaultMessage: '空字符串转为空值',
            }), //'空字符串转为空值'
          );
        }

        return (
          <>
            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.TaskNumber',
                  defaultMessage: '任务编号',
                }) /* 任务编号 */
              }
              content={task?.id}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Database',
                  defaultMessage: '所属数据库',
                }) /* 所属数据库 */
              }
              content={<DatabaseLabel database={task?.database} />}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.DataSource',
                  defaultMessage: '所属数据源',
                }) /* 所属数据源 */
              }
              content={task?.database?.dataSource?.name || '-'}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Type',
                  defaultMessage: '任务类型',
                }) /* 任务类型 */
              }
              content={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ExportResultSet',
                  defaultMessage: '导出结果集',
                }) /* 导出结果集 */
              }
            />

            {hasFlow && (
              <SimpleTextItem
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.RiskLevel',
                    defaultMessage: '风险等级',
                  }) /* 风险等级 */
                }
                content={<RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />}
              />
            )}

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.SQLContent',
                  defaultMessage: 'SQL 内容',
                }) /* SQL 内容 */
              }
              content={
                <div
                  style={{
                    marginTop: '8px',
                  }}
                >
                  <SQLContent
                    theme={theme}
                    sqlContent={parameters?.sql}
                    sqlObjectIds={null}
                    sqlObjectNames={null}
                    taskId={task?.id}
                    language={
                      getDataSourceModeConfigByConnectionMode(
                        _task?.database?.dataSource?.dialectType,
                      )?.sql?.language
                    }
                  />
                </div>
              }
              direction="column"
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.QueryResultsLimit',
                  defaultMessage: '查询结果限制',
                }) /* 查询结果限制 */
              }
              content={parameters?.maxRows}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FileName',
                  defaultMessage: '文件名',
                }) /* 文件名 */
              }
              content={parameters?.fileName}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FileFormat',
                  defaultMessage: '文件格式',
                }) /* 文件格式 */
              }
              content={parameters?.fileFormat}
            />

            {parameters?.fileFormat === IExportResultSetFileType.CSV && (
              <>
                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.CSVFileSettings',
                      defaultMessage: 'CSV 文件设置',
                    }) /* CSV 文件设置 */
                  }
                  content={csvFormat?.join('、')}
                />

                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FieldSeparator',
                      defaultMessage: '字段分隔符',
                    }) /* 字段分隔符 */
                  }
                  content={parameters?.csvFormat?.columnSeparator}
                />

                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.TextRecognitionSymbol',
                      defaultMessage: '文本识别符',
                    }) /* 文本识别符 */
                  }
                  content={parameters?.csvFormat?.columnDelimiter}
                />

                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ReplacementSymbol',
                      defaultMessage: '换行符号',
                    }) /* 换行符号 */
                  }
                  content={parameters?.csvFormat?.lineSeparator}
                />
              </>
            )}

            {parameters?.fileFormat === IExportResultSetFileType.SQL && (
              <SimpleTextItem
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.SpecifiedTableName',
                    defaultMessage: '指定表名',
                  }) /* 指定表名 */
                }
                content={parameters?.tableName ?? '-'}
              />
            )}

            {parameters?.fileFormat === IExportResultSetFileType.EXCEL && (
              <>
                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Contain.1',
                      defaultMessage: '包含列头',
                    }) /* 包含列头 */
                  }
                  content={
                    parameters?.csvFormat?.isContainColumnHeader
                      ? formatMessage({
                          id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Yes',
                          defaultMessage: '是',
                        }) //'是'
                      : formatMessage({
                          id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.No',
                          defaultMessage: '否',
                        }) //'否'
                  }
                />

                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ExportSQLToAnotherSheet',
                      defaultMessage: '导出 SQL 到另一个 Sheet',
                    }) /* 导出 SQL 到另一个 Sheet */
                  }
                  content={
                    parameters?.saveSql
                      ? formatMessage({
                          id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Yes.1',
                          defaultMessage: '是',
                        }) //'是'
                      : formatMessage({
                          id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.No.1',
                          defaultMessage: '否',
                        }) //'否'
                  }
                />
              </>
            )}

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FileEncoding',
                  defaultMessage: '文件编码',
                }) /* 文件编码 */
              }
              content={parameters?.fileEncoding}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ImplementationModalities',
                  defaultMessage: '执行方式',
                }) /* 执行方式 */
              }
              content={taskExecStrategyMap[task?.executionStrategy]}
            />

            {task?.executionStrategy === TaskExecStrategy.TIMER && (
              <SimpleTextItem
                label={
                  formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ExecutionTime',
                    defaultMessage: '执行时间',
                  }) /* 执行时间 */
                }
                content={getFormatDateTime(task?.executionTime)}
              />
            )}

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.MissionDetails',
                  defaultMessage: '任务描述',
                }) /* 任务描述 */
              }
              content={task?.description}
              direction="column"
            />

            <Divider
              style={{
                marginTop: 4,
              }}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Founder',
                  defaultMessage: '创建人',
                }) /* 创建人 */
              }
              content={task?.creator?.name || '-'}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.CreationTime',
                  defaultMessage: '创建时间',
                }) /* 创建时间 */
              }
              content={getFormatDateTime(task?.createTime)}
            />
          </>
        );
      },
    },
  ].filter(Boolean);
  return res;
};
