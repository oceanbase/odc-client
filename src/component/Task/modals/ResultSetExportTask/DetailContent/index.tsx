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

import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import RiskLevelLabel, { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import type { IResultSetExportTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { IExportResultSetFileType, TaskExecStrategy } from '@/d.ts';
import { CRLFToSeparatorString, getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider } from 'antd';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getTaskExecStrategyMap } from '@/component/Task/const';
import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';
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
            <Descriptions column={2}>
              <Descriptions.Item label={'ID'}>{task?.id}</Descriptions.Item>
              <Descriptions.Item label={'类型'}>
                {formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ExportResultSet',
                  defaultMessage: '导出结果集',
                })}
              </Descriptions.Item>
              <Descriptions.Item label={'数据库'}>
                <EllipsisText
                  content={<DatabaseLabel database={task?.database} />}
                  needTooltip={false}
                />
              </Descriptions.Item>
              <Descriptions.Item label={'数据源'}>
                <EllipsisText content={task?.database?.dataSource?.name} />
              </Descriptions.Item>
              {!login.isPrivateSpace() && (
                <Descriptions.Item label={'项目'}>
                  <EllipsisText content={task?.project?.name} />
                </Descriptions.Item>
              )}
              {hasFlow && (
                <Descriptions.Item
                  span={2}
                  label={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.DetailContent.7A621BB2',
                    defaultMessage: '风险等级',
                  })}
                >
                  <ODCRiskLevelLabel iconMode levelMap level={task?.riskLevel?.level} />
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

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
            <Descriptions column={2}>
              <Descriptions.Item label={'查询结果限制'}>{parameters?.maxRows}</Descriptions.Item>
              <Descriptions.Item label={'文件名'}>{parameters?.fileName}</Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FileFormat',
                  defaultMessage: '文件格式',
                })}
              >
                {parameters?.fileFormat}
              </Descriptions.Item>

              {parameters?.fileFormat === IExportResultSetFileType.CSV && (
                <>
                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.CSVFileSettings',
                      defaultMessage: 'CSV 文件设置',
                    })}
                  >
                    {csvFormat?.join('、')}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.FieldSeparator',
                      defaultMessage: '字段分隔符',
                    })}
                  >
                    {parameters?.csvFormat?.columnSeparator}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.TextRecognitionSymbol',
                      defaultMessage: '文本识别符',
                    })}
                  >
                    {parameters?.csvFormat?.columnDelimiter}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={formatMessage({
                      id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ReplacementSymbol',
                      defaultMessage: '换行符号',
                    })}
                  >
                    {CRLFToSeparatorString(parameters?.csvFormat?.lineSeparator)}
                  </Descriptions.Item>
                </>
              )}
              {parameters?.fileFormat === IExportResultSetFileType.SQL && (
                <Descriptions.Item
                  label={formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.SpecifiedTableName',
                    defaultMessage: '指定表名',
                  })}
                >
                  {parameters?.tableName ?? '-'}
                </Descriptions.Item>
              )}
              {parameters?.fileFormat === IExportResultSetFileType.EXCEL && (
                <Descriptions.Item
                  label={formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Contain.1',
                    defaultMessage: '包含列头',
                  })}
                >
                  {parameters?.csvFormat?.isContainColumnHeader
                    ? formatMessage({
                        id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.Yes',
                        defaultMessage: '是',
                      }) //'是'
                    : formatMessage({
                        id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.No',
                        defaultMessage: '否',
                      })}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={'文件编码'}>{parameters?.fileEncoding}</Descriptions.Item>
              <Descriptions.Item
                label={formatMessage({
                  id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ImplementationModalities',
                  defaultMessage: '执行方式',
                })}
              >
                {taskExecStrategyMap[task?.executionStrategy]}
              </Descriptions.Item>

              {task?.executionStrategy === TaskExecStrategy.TIMER && (
                <Descriptions.Item
                  label={formatMessage({
                    id: 'odc.src.component.Task.ResultSetExportTask.DetailContent.ExecutionTime',
                    defaultMessage: '执行时间',
                  })}
                >
                  {getFormatDateTime(task?.executionTime)}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Descriptions column={2}>
              <Descriptions.Item span={2} label={'任务描述'}>
                {task?.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider
              style={{
                marginTop: 12,
              }}
            />
            <Descriptions column={2}>
              <Descriptions.Item label={'创建人'}>{task?.creator?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label={'创建时间'}>
                {getFormatDateTime(task?.createTime)}
              </Descriptions.Item>
            </Descriptions>
          </>
        );
      },
    },
  ].filter(Boolean);
  return res;
};
