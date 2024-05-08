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
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type { IAsyncTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Descriptions, Divider, Space, Tooltip } from 'antd';
import DatabaseLabel from '../../component/DatabaseLabel';
import { DownloadFileAction } from '../../component/DownloadFileAction';
import { SimpleTextItem } from '../../component/SimpleTextItem';
export const ErrorStrategy = {
  ABORT: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.StopATask',
  }),
  // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
  }),

  // 忽略错误继续任务
};

interface IProps {
  task: TaskDetail<IAsyncTaskParams>;
  result: ITaskResult;
  hasFlow: boolean;
  theme?: string;
}
const AsyncTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, result, theme } = props;
  const parameters = task?.parameters;
  const executionTimeout = milliSecondsToHour(parameters.timeoutMillis);
  const riskLevel = task?.riskLevel;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.TaskNumber',
            }) /* 任务编号 */
          }
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Database',
            }) /* 所属数据库 */
          }
        >
          <DatabaseLabel database={task?.database} />
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.DataSource',
            }) /* 所属数据源 */
          }
        >
          {task?.database?.dataSource?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Type',
            }) /* 任务类型 */
          }
        >
          {
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.DatabaseChange',
            }) /* 
          数据库变更
          */
          }
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.AsyncTask.DetailContent.RiskLevel',
              }) /* 风险等级 */
            }
          >
            <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.TaskManagePage.AsyncTask.SqlContent',
        })}
        /* SQL 内容 */ content={
          <div
            style={{
              marginTop: '8px',
            }}
          >
            <SQLContent
              theme={theme}
              sqlContent={task?.parameters?.sqlContent}
              sqlObjectIds={task?.parameters?.sqlObjectIds}
              sqlObjectNames={task?.parameters?.sqlObjectNames}
              taskId={task?.id}
              language={
                getDataSourceModeConfigByConnectionMode(task?.database?.dataSource?.dialectType)
                  ?.sql?.language
              }
            />
          </div>
        }
        direction="column"
      />

      <SimpleTextItem
        label={
          <Space>
            <span>
              {
                formatMessage({
                  id: 'odc.AsyncTask.DetailContent.RollbackContent',
                }) /*回滚内容*/
              }
            </span>
            <DownloadFileAction url={result?.rollbackPlanResult?.resultFileDownloadUrl} />
          </Space>
        }
        content={
          <div
            style={{
              marginTop: '8px',
            }}
          >
            <SQLContent
              theme={theme}
              sqlContent={task?.parameters?.rollbackSqlContent}
              sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
              sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
              taskId={task?.id}
              language={
                getDataSourceModeConfigByConnectionMode(task?.database?.dataSource?.dialectType)
                  ?.sql?.language
              }
            />
          </div>
        }
        direction="column"
      />

      <Descriptions
        column={2}
        style={{
          marginTop: '8px',
        }}
      >
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Separatist',
            }) /* 分隔符 */
          }
        >
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.QueryResultsLimit',
            }) /* 查询结果限制 */
          }
        >
          {parameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.MissionErrorTreatment',
            }) /* 任务错误处理 */
          }
        >
          {ErrorStrategy[parameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'src.component.Task.AsyncTask.DetailContent.1F4ECA8A',
            }) /*"SQL 重试次数"*/
          }
        >
          {parameters?.retryTimes ?? 0}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.ExecuteTimeoutTime',
            }) /* 执行超时时间 */
          }
        >
          <Space align="center" size={6}>
            <div>
              {formatMessage(
                {
                  id: 'odc.TaskManagePage.AsyncTask.ExecutiontimeoutHours',
                },
                {
                  executionTimeout,
                },
              )}
            </div>
            {result?.autoModifyTimeout && (
              <Tooltip
                title={
                  formatMessage(
                    { id: 'src.component.Task.AsyncTask.DetailContent.07EB87E6' },
                    { executionTimeout: executionTimeout },
                  ) /*`变更语句中包含索引变更，可能耗时较久，已将您的变更工单超时时间调整为 ${executionTimeout} 小时`*/
                }
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <InfoCircleOutlined style={{ cursor: 'pointer' }} />
                </div>
              </Tooltip>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.ImplementationModalities',
            }) /* 执行方式 */
          }
        >
          {taskExecStrategyMap[task?.executionStrategy]}
        </Descriptions.Item>
        {task?.executionStrategy === TaskExecStrategy.TIMER && (
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'odc.src.component.Task.AsyncTask.DetailContent.ExecutionTime',
              }) /* 执行时间 */
            }
          >
            {getFormatDateTime(task?.executionTime)}
          </Descriptions.Item>
        )}

        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.MissionDetails',
            }) /* 任务描述 */
          }
        >
          {task?.description}
        </Descriptions.Item>
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Founder',
            }) /* 创建人 */
          }
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.CreationTime',
            }) /* 创建时间 */
          }
        >
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default AsyncTaskContent;
