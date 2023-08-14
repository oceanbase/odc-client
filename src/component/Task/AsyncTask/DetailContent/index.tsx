import RiskLevelLabel from '@/component/RiskLevelLabel';
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type { IAsyncTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import { DownloadFileAction } from '../../component/DownloadFileAction';
import { SimpleTextItem } from '../../component/SimpleTextItem';

export const ErrorStrategy = {
  ABORT: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.StopATask' }), // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
  }),

  // 忽略错误继续任务
};

interface IProps {
  task: TaskDetail<IAsyncTaskParams>;
  result: ITaskResult;
  hasFlow: boolean;
}

const AsyncTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, result } = props;
  const parameters = task?.parameters;
  const executionTimeout = parameters.timeoutMillis / 1000 / 60 / 60;
  const riskLevel = task?.riskLevel;
  const isMySQL = task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item span={2} label="任务编号">
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="所属数据库">
          {task?.databaseName || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="任务类型">
          数据库变更
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item label="风险等级">
            <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>
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
        label={
          <Space>
            <span>
              {
                formatMessage({
                  id: 'odc.AsyncTask.DetailContent.RollbackContent',
                }) /*回滚内容*/
              }
            </span>
            <DownloadFileAction taskId={task?.id} objectId={result?.rollbackPlanResult?.objectId} />
          </Space>
        }
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
      <Descriptions column={2} style={{ marginTop: '8px' }}>
        <Descriptions.Item span={2} label="分隔符">
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="查询结果限制">
          {parameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="任务错误处理">
          {ErrorStrategy[parameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="执行超时时间">
          {formatMessage(
            {
              id: 'odc.TaskManagePage.AsyncTask.ExecutiontimeoutHours',
            },

            { executionTimeout },
          )}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="执行方式">
          {taskExecStrategyMap[task?.executionStrategy]}
        </Descriptions.Item>
        {task?.executionStrategy === TaskExecStrategy.TIMER && (
          <Descriptions.Item span={2} label="执行时间">
            {getFormatDateTime(task?.executionTime)}
          </Descriptions.Item>
        )}
        <Descriptions.Item span={2} label="任务描述">
          {task?.description}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item span={2} label="创建人">
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item span={2} label="创建时间">
          {getFormatDateTime(task?.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default AsyncTaskContent;
