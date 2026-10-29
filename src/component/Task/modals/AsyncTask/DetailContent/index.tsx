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
import type { IAsyncTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { TaskExecStrategy, TaskFlowNodeType, TaskNodeStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/data/dateTime';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Descriptions, Divider, Space, Tooltip } from 'antd';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { DownloadFileAction } from '@/component/Task/component/DownloadFileAction';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import styles from './index.less';
import login from '@/store/login';
import { getTaskExecStrategyMap } from '@/component/Task/const';
import { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import EllipsisText from '@/component/EllipsisText';

export const ErrorStrategy = {
  ABORT: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.StopATask',
    defaultMessage: '停止任务',
  }),
  // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
    defaultMessage: '忽略错误继续任务',
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
  const node = task.nodeList.find((item) => item.taskType === 'PRE_CHECK');
  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item span={1} label={'ID'}>
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={formatMessage({
            id: 'src.component.Task.modals.AsyncTask.DetailContent.E0A6F474',
            defaultMessage: '类型',
          })}
        >
          {formatMessage({
            id: 'src.component.Task.modals.AsyncTask.DetailContent.05AA31FE',
            defaultMessage: '数据库变更',
          })}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={formatMessage({
            id: 'src.component.Task.modals.AsyncTask.DetailContent.960A276C',
            defaultMessage: '数据库',
          })}
        >
          <EllipsisText content={<DatabaseLabel database={task?.database} />} needTooltip={false} />
        </Descriptions.Item>

        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.modals.AsyncTask.DetailContent.A914AFA2',
            defaultMessage: '数据源',
          })}
        >
          <EllipsisText content={task?.database?.dataSource?.name} />
        </Descriptions.Item>
        {!login.isPrivateSpace() && (
          <Descriptions.Item
            span={1}
            label={formatMessage({
              id: 'src.component.Task.modals.AsyncTask.DetailContent.409488B1',
              defaultMessage: '项目',
            })}
          >
            <EllipsisText content={task?.project?.name} />
          </Descriptions.Item>
        )}

        {hasFlow && (
          <Descriptions.Item
            span={1}
            label={
              formatMessage({
                id: 'odc.src.component.Task.AsyncTask.DetailContent.RiskLevel',
                defaultMessage: '风险等级',
              }) /* 风险等级 */
            }
          >
            <ODCRiskLevelLabel iconMode levelMap level={riskLevel?.level} />
          </Descriptions.Item>
        )}
        <Descriptions.Item
          span={2}
          label={formatMessage({
            id: 'src.component.Task.modals.AsyncTask.DetailContent.D4F05610',
            defaultMessage: '描述',
          })}
        >
          {task?.description}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <div className={styles.format}>
        <SimpleTextItem
          label={formatMessage({
            id: 'odc.TaskManagePage.AsyncTask.SqlContent',
            defaultMessage: 'SQL 内容',
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
      </div>
      <div className={styles.format}>
        <SimpleTextItem
          label={
            <Space>
              <span>
                {
                  formatMessage({
                    id: 'odc.AsyncTask.DetailContent.RollbackContent',
                    defaultMessage: '回滚内容',
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
      </div>

      <Descriptions
        column={2}
        style={{
          marginTop: '8px',
        }}
      >
        {!login.isPrivateSpace() && (
          <Descriptions.Item
            span={1}
            label={formatMessage({
              id: 'src.component.Task.AsyncTask.DetailContent.D9CDFEE1',
              defaultMessage: 'DML语句预估影响行数',
            })}
          >
            {node?.status === TaskNodeStatus.EXECUTING ? (
              <LoadingOutlined />
            ) : task?.affectedRows === -1 ? (
              formatMessage({
                id: 'src.component.Task.AsyncTask.DetailContent.4F8FADD3',
                defaultMessage: '该 SQL 语句不支持',
              })
            ) : (
              task?.affectedRows || '-'
            )}
          </Descriptions.Item>
        )}
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Separatist',
              defaultMessage: '分隔符',
            }) /* 分隔符 */
          }
        >
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.QueryResultsLimit',
              defaultMessage: '查询结果限制',
            }) /* 查询结果限制 */
          }
        >
          {parameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.MissionErrorTreatment',
              defaultMessage: '任务错误处理',
            }) /* 任务错误处理 */
          }
        >
          {ErrorStrategy[parameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'src.component.Task.AsyncTask.DetailContent.1F4ECA8A',
              defaultMessage: 'SQL 重试次数',
            }) /*"SQL 重试次数"*/
          }
        >
          {parameters?.retryTimes ?? 0}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.ExecuteTimeoutTime',
              defaultMessage: '执行超时时间',
            }) /* 执行超时时间 */
          }
        >
          <Space align="center" size={6}>
            <div>
              {formatMessage(
                {
                  id: 'odc.TaskManagePage.AsyncTask.ExecutiontimeoutHours',
                  defaultMessage: '{executionTimeout} 小时',
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
                    {
                      id: 'src.component.Task.AsyncTask.DetailContent.07EB87E6',
                      defaultMessage:
                        '变更语句中包含索引变更，可能耗时较久，已将您的变更工单超时时间调整为 {executionTimeout} 小时',
                    },
                    { executionTimeout },
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
              defaultMessage: '执行方式',
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
                defaultMessage: '执行时间',
              }) /* 执行时间 */
            }
          >
            {getFormatDateTime(task?.executionTime)}
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />

      <Descriptions column={2}>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.Founder',
              defaultMessage: '创建人',
            }) /* 创建人 */
          }
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          span={1}
          label={
            formatMessage({
              id: 'odc.src.component.Task.AsyncTask.DetailContent.CreationTime',
              defaultMessage: '创建时间',
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
