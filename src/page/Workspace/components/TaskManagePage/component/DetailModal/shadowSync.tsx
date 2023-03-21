import { getShadowSyncAnalysisResult } from '@/common/network/task';
import { TaskDetail, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { TaskExecStrategyMap } from '../..';
import {
  ErrorStrategy,
  IShadowSyncAnalysisResult,
  ShadowTableSyncTaskResult,
} from '../../../CreateShadowSyncModal/interface';
import StructAnalysisResult from '../../../CreateShadowSyncModal/StructConfigPanel/StructAnalysisResult';

interface IShadowSyncParamters {
  errorStrategy: ErrorStrategy;
  connectionId: string;
  schemaName: string;
  comparingTaskId: string;
  description: string;
}

const ErrorStrategyText = {
  ABORT: formatMessage({ id: 'odc.TaskManagePage.AsyncTask.StopATask' }), // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
  }),

  // 忽略错误继续任务
};

function StructAnalysisWrap({
  data,
  comparingTaskId,
}: {
  data: ShadowTableSyncTaskResult;
  comparingTaskId: string;
}) {
  const [result, setResult] = useState<IShadowSyncAnalysisResult>(null);
  async function getResult() {
    if (!comparingTaskId) {
      return;
    }
    const result = await getShadowSyncAnalysisResult(comparingTaskId);
    setResult(result);
  }
  useEffect(() => {
    getResult();
  }, [comparingTaskId]);
  if (!comparingTaskId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin />
      </div>
    );
  }
  return <StructAnalysisResult data={result} resultData={data} />;
}

export function getItems(
  task: TaskDetail<IShadowSyncParamters>,
  result: ShadowTableSyncTaskResult,
  hasFlow: boolean,
): {
  sectionName?: string;
  textItems: [string, string | number, number?][];
  sectionRender?: (task: TaskDetail<IShadowSyncParamters>) => void;
}[] {
  const { parameters } = task;
  if (!task) {
    return [];
  }
  const maxRiskLevel = task?.maxRiskLevel;
  const riskItem: [string, string] = [
    formatMessage({ id: 'odc.component.DetailModal.dataMocker.RiskLevel' }), //风险等级
    formatMessage(
      {
        id: 'odc.component.DetailModal.dataMocker.Maxrisklevel',
      },

      { maxRiskLevel: maxRiskLevel },
    ),

    //风险等级
  ];
  const isTimerExecution = task?.executionStrategy === TaskExecStrategy.TIMER;
  const timerExecutionItem: [string, string] = [
    formatMessage({
      id: 'odc.component.DetailModal.dataMocker.ExecutionTime',
    }),
    //执行时间
    getFormatDateTime(task?.executionTime),
  ];

  return [
    {
      //@ts-ignore
      textItems: [
        [
          formatMessage({
            id: 'odc.component.DetailModal.permission.TaskNumber',
          }),

          task.id,
        ],

        [
          formatMessage({
            id: 'odc.component.DetailModal.permission.TaskType',
          }),
          formatMessage({
            id: 'odc.component.DetailModal.shadowSync.ShadowTableSynchronization',
          }), //影子表同步
        ],

        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.Connection',
          }),

          //所属连接
          task?.connection?.name || '-',
        ],

        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.Database',
          }),

          //所属数据库
          task?.databaseName || '-',
        ],

        hasFlow ? riskItem : null,
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.ExecutionMethod',
          }),

          //执行方式
          TaskExecStrategyMap[task?.executionStrategy],
        ],

        isTimerExecution ? timerExecutionItem : null,
        [
          formatMessage({
            id: 'odc.TaskManagePage.AsyncTask.TaskErrorHandling',
          }),

          ErrorStrategyText[parameters.errorStrategy],
        ],

        [
          formatMessage({ id: 'odc.component.DetailModal.shadowSync.Remarks' }), //备注
          task?.description,
          2,
        ],
      ].filter(Boolean),
    },

    {
      sectionName: formatMessage({
        id: 'odc.component.DetailModal.shadowSync.StructuralAnalysis',
      }), //结构分析
      sectionRender: (task) => {
        return <StructAnalysisWrap comparingTaskId={parameters.comparingTaskId} data={result} />;
      },
      textItems: [],
    },

    {
      textItems: [
        [
          formatMessage({ id: 'odc.component.DetailModal.dataMocker.Created' }), //创建人
          task?.creator?.name || '-',
        ],

        [
          formatMessage({ id: 'odc.TaskManagePage.DataMocker.CreationTime' }), // 创建时间
          getFormatDateTime(task.createTime),
        ],
      ],
    },
  ];
}
