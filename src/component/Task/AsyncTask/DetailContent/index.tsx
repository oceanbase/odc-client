import { SQLContent } from '@/component/SQLContent';
import { TaskExecStrategyMap } from '@/component/Task';
import type { IAsyncTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Divider } from 'antd';
import { SimpleTextItem } from '../../component/SimpleTextItem';

export const ErrorStrategy = {
  ABORT: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.StopATask' }), // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
  }),

  // 忽略错误继续任务
};

export const getItems = (
  _task: TaskDetail<IAsyncTaskParams>,
  result: ITaskResult,
  hasFlow: boolean,
) => {
  if (!_task) {
    return [];
  }
  const isMySQL = _task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  const res: {
    sectionName?: string;
    textItems: [string, string | number, number?][];
    sectionRender?: (task: TaskDetail<IAsyncTaskParams>) => void;
  }[] = [
    {
      textItems: [],
      sectionRender: (task: TaskDetail<IAsyncTaskParams>) => {
        const parameters = task?.parameters;
        const executionTimeout = parameters.timeoutMillis / 1000 / 60 / 60;
        const maxRiskLevel = task?.maxRiskLevel;
        return (
          <>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.TaskNo',
              })}
              /*任务编号*/ content={task?.id}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.Connection',
              })}
              /*所属连接*/ content={task?.connection?.name || '-'}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.Database',
              })}
              /*所属数据库*/ content={task?.databaseName || '-'}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.TaskType',
              })}
              /*任务类型*/ content={formatMessage({
                id: 'odc.component.AsyncTaskModal.DatabaseChanges',
              })}

              /*数据库变更*/
            />

            {hasFlow && (
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.AsyncTaskModal.RiskLevel',
                })}
                /*风险等级*/ content={
                  formatMessage(
                    {
                      id: 'odc.component.AsyncTaskModal.Maxrisklevel',
                    },

                    { maxRiskLevel: maxRiskLevel },
                  )
                  //`${maxRiskLevel}级`
                }
              />
            )}

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.TaskManagePage.AsyncTask.SqlContent',
              })}
              /* SQL 内容 */
              content={
                <div style={{ marginTop: '8px' }}>
                  <SQLContent
                    sqlContent={task?.parameters?.sqlContent}
                    sqlObjectIds={task?.parameters?.sqlObjectIds}
                    sqlObjectNames={task?.parameters?.sqlObjectNames}
                    taskId={task?.id}
                    isMySQL={isMySQL}
                  />
                </div>
              }
              direction="column"
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.RollbackContent',
              })}
              /*回滚内容*/
              content={
                <div style={{ marginTop: '8px' }}>
                  <SQLContent
                    sqlContent={task?.parameters?.rollbackSqlContent}
                    sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
                    sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
                    taskId={task?.id}
                    isMySQL={isMySQL}
                  />
                </div>
              }
              direction="column"
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.TaskManagePage.AsyncTask.Separator',
                })

                // 分隔符
              } /* 任务错误处理 */
              content={parameters.delimiter}
            />

            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.TaskManagePage.AsyncTask.QueryResultLimits',
                })

                // 查询结果限制
              } /* 任务错误处理 */
              content={parameters.queryLimit}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.TaskManagePage.AsyncTask.TaskErrorHandling',
              })}
              /* 任务错误处理 */
              content={ErrorStrategy[parameters.errorStrategy]}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.TaskManagePage.AsyncTask.ExecutionTimeout',
              })}
              /* 执行超时时间 */
              content={
                formatMessage(
                  {
                    id: 'odc.TaskManagePage.AsyncTask.ExecutiontimeoutHours',
                  },

                  { executionTimeout },
                )

                // `${executionTimeout} 小时`
              }
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.ExecutionMethod',
              })}
              /*执行方式*/
              content={TaskExecStrategyMap[task?.executionStrategy]}
            />

            {task?.executionStrategy === TaskExecStrategy.TIMER && (
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.AsyncTaskModal.ExecutionTime',
                })}
                /*执行时间*/ content={getFormatDateTime(task?.executionTime)}
              />
            )}

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.TaskManagePage.AsyncTask.TaskDescription',
              })}
              /* 任务描述 */ content={task.description}
              direction="column"
            />

            <Divider style={{ marginTop: 4 }} />
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.AsyncTaskModal.Created',
              })}
              /*创建人*/ content={task?.creator?.name || '-'}
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.TaskManagePage.AsyncTask.Created',
              })}
              /* 创建时间 */ content={getFormatDateTime(task.createTime)}
            />
          </>
        );
      },
    },
  ].filter(Boolean);
  return res;
};
