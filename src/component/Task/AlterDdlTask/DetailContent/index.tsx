import { SQLContent } from '@/component/SQLContent';
import { TaskExecStrategyMap } from '@/component/Task';
import type { ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, TaskExecStrategy } from '@/d.ts';
import { getFormatDateTime, secondsToHour } from '@/util/utils';
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
  ABORT: '停止任务',
  CONTINUE: '忽略错误继续任务',
};

const ClearStrategyMap = {
  [ClearStrategy.ORIGIN_TABLE_DROP]: '立即删除',
  [ClearStrategy.ORIGIN_TABLE_RENAME_AND_RESERVED]: '重命名不处理',
};

const SQLContentSection = ({ task }) => {
  const isMySQL = task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  return (
    <SimpleTextItem
      label="SQL 内容"
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
  const maxRiskLevel = task?.maxRiskLevel;
  const isTimerExecution = task?.executionStrategy === TaskExecStrategy.TIMER;
  const riskItem: [string, string] = ['风险等级', `${maxRiskLevel}级`];
  const timerExecutionItem: [string, string] = ['执行时间', getFormatDateTime(task?.executionTime)];
  return [
    {
      // @ts-ignore
      textItems: [
        ['任务编号', task.id],
        ['任务类型', '无锁结构变更'],
        ['所属库', task?.databaseName || '-'],
        hasFlow ? riskItem : null,
        ['变更定义', TaskExecStrategyMap[task?.executionStrategy], hasFlow ? 2 : 1],
        [null, <SQLContentSection task={task} key={task.id} />, 2],
        ['锁表超时时间', `${secondsToHour(parameters?.lockTableTimeOutSeconds)} 小时`],
        ['失败重试次数', parameters?.swapTableNameRetryTimes],
        ['完成后源表清理策略', ClearStrategyMap[parameters?.originTableCleanStrategy]],
        ['执行方式', TaskExecStrategyMap[task?.executionStrategy]],
        isTimerExecution ? timerExecutionItem : null,
        ['任务错误处理', ErrorStrategyText[parameters.errorStrategy], 2],
        ['备注', task?.description, 2],
      ].filter(Boolean),
    },
    {
      textItems: [
        ['创建人', task?.creator?.name || '-', 2],
        ['创建时间', getFormatDateTime(task.createTime), 2],
      ],
    },
  ];
}
