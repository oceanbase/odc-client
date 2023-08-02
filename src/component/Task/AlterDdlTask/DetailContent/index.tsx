import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type { ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import React from 'react';
import { SimpleTextItem } from '../../component/SimpleTextItem';
import { ClearStrategy } from '../CreateModal';

interface IDDLAlterParamters {
  errorStrategy: TaskExecStrategy;
  connectionId: string;
  schemaName: string;
  comparingTaskId: string;
  description: string;
  // 单位：秒
  lockTableTimeOutSeconds: number;
  swapTableNameRetryTimes: number;
  originTableCleanStrategy: ClearStrategy;
}

const ErrorStrategyText = {
  ABORT: formatMessage({ id: 'odc.AlterDdlTask.DetailContent.StopATask' }), //停止任务
  CONTINUE: formatMessage({ id: 'odc.AlterDdlTask.DetailContent.IgnoreErrorsToContinueThe' }), //忽略错误继续任务
};

const ClearStrategyMap = {
  [ClearStrategy.ORIGIN_TABLE_DROP]: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.DeleteNow',
  }), //立即删除
  [ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED]: formatMessage({
    id: 'odc.AlterDdlTask.DetailContent.RenameNotProcessed',
  }), //重命名不处理
};

const SQLContentSection = ({ task }) => {
  const isMySQL = task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  return (
    <SimpleTextItem
      label={formatMessage({ id: 'odc.AlterDdlTask.DetailContent.SqlContent' })} /*SQL 内容*/
      content={
        <div style={{ marginTop: '8px' }}>
          <SQLContent
            sqlContent={task?.parameters?.sqlContent}
            sqlObjectIds={null}
            sqlObjectNames={null}
            taskId={task?.id}
            isMySQL={isMySQL}
          />
        </div>
      }
      direction="column"
    />
  );
};
export function getItems(
  task: TaskDetail<IDDLAlterParamters>,
  result: ITaskResult,
  hasFlow: boolean,
): {
  sectionName?: string;
  textItems: [React.ReactNode, React.ReactNode, number?][];
  sectionRender?: (task: TaskDetail<IDDLAlterParamters>) => void;
}[] {
  const { parameters } = task;
  if (!task) {
    return [];
  }
  const riskLevel = task?.riskLevel;
  const isTimerExecution = task?.executionStrategy === TaskExecStrategy.TIMER;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const riskItem: [string, string] = [
    formatMessage({ id: 'odc.AlterDdlTask.DetailContent.RiskLevel' }), //风险等级
    formatMessage(
      {
        id: 'odc.AlterDdlTask.DetailContent.MaxrisklevelLevel',
      },
      { maxRiskLevel: riskLevel },
    ), //`${maxRiskLevel}级`
  ];
  const timerExecutionItem: [string, string] = [
    formatMessage({ id: 'odc.AlterDdlTask.DetailContent.ExecutionTime' }), //执行时间
    getFormatDateTime(task?.executionTime),
  ];

  return [
    {
      // @ts-ignore
      textItems: [
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.TaskNumber' }), //任务编号
          task.id,
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.TaskType' }), //任务类型
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.LockFreeStructureChange' }), //无锁结构变更
        ],
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.Library' }), //所属库
          task?.databaseName || '-',
        ],

        hasFlow ? riskItem : null,
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.ChangeDefinition' }), //变更定义
          taskExecStrategyMap[task?.executionStrategy],
          hasFlow ? 2 : 1,
        ],

        [null, <SQLContentSection task={task} key={task.id} />, 2],
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.LockTableTimeout' }), //锁表超时时间
          `${parameters?.lockTableTimeOutSeconds}s`,
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.NumberOfFailedRetries' }), //失败重试次数
          parameters?.swapTableNameRetryTimes,
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.SourceTableCleanupPolicyAfter' }), //完成后源表清理策略
          ClearStrategyMap[parameters?.originTableCleanStrategy],
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.ExecutionMethod' }), //执行方式
          taskExecStrategyMap[task?.executionStrategy],
        ],

        isTimerExecution ? timerExecutionItem : null,
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.TaskErrorHandling' }), //任务错误处理
          ErrorStrategyText[parameters.errorStrategy],
          2,
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.Description' }), //描述
          task?.description,
          2,
        ],
      ].filter(Boolean),
    },
    {
      textItems: [
        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.Founder' }), //创建人
          task?.creator?.name || '-',
          2,
        ],

        [
          formatMessage({ id: 'odc.AlterDdlTask.DetailContent.CreationTime' }), //创建时间
          getFormatDateTime(task.createTime),
          2,
        ],
      ],
    },
  ];
}
