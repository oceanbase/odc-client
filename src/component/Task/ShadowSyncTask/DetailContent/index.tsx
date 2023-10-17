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

import { getShadowSyncAnalysisResult } from '@/common/network/task';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import {
  ErrorStrategy,
  IShadowSyncAnalysisResult,
  ShadowTableSyncTaskResult,
} from '@/component/Task/ShadowSyncTask/CreateModal/interface';
import StructAnalysisResult from '@/component/Task/ShadowSyncTask/CreateModal/StructConfigPanel/StructAnalysisResult';
import { ConnectionMode, TaskDetail, TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { getTaskExecStrategyMap } from '../..';
interface IShadowSyncParamters {
  errorStrategy: ErrorStrategy;
  connectionId: string;
  schemaName: string;
  comparingTaskId: string;
  description: string;
}
const ErrorStrategyText = {
  ABORT: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.StopATask',
  }),
  // 停止任务
  CONTINUE: formatMessage({
    id: 'odc.TaskManagePage.AsyncTask.IgnoreErrorsContinueTasks',
  }),

  // 忽略错误继续任务
};

function StructAnalysisWrap({
  data,
  comparingTaskId,
  connectionMode,
}: {
  data: ShadowTableSyncTaskResult;
  comparingTaskId: string;
  connectionMode: ConnectionMode;
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
  return <StructAnalysisResult connectionMode={connectionMode} data={result} resultData={data} />;
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
  const riskLevel = task?.riskLevel;
  const connectionMode = task?.connection?.dbMode;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const riskItem = [
    formatMessage({
      id: 'odc.component.DetailModal.dataMocker.RiskLevel',
    }),
    //风险等级
    <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />,
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
            id: 'odc.component.DetailModal.dataMocker.Database',
          }),
          //所属数据库
          task?.databaseName || '-',
        ],
        [
          formatMessage({
            id: 'odc.src.component.Task.ShadowSyncTask.DetailContent.DataSource',
          }), //'所属数据源'
          task?.connection?.name || '-',
        ],
        hasFlow ? riskItem : null,
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.ExecutionMethod',
          }),
          //执行方式
          taskExecStrategyMap[task?.executionStrategy],
        ],
        isTimerExecution ? timerExecutionItem : null,
        [
          formatMessage({
            id: 'odc.TaskManagePage.AsyncTask.TaskErrorHandling',
          }),
          ErrorStrategyText[parameters.errorStrategy],
        ],
        [
          formatMessage({
            id: 'odc.ShadowSyncTask.DetailContent.Description',
          }),
          //描述
          task?.description,
          2,
        ],
      ].filter(Boolean),
    },
    {
      sectionName: formatMessage({
        id: 'odc.component.DetailModal.shadowSync.StructuralAnalysis',
      }),
      //结构分析
      sectionRender: (task) => {
        return (
          <StructAnalysisWrap
            connectionMode={connectionMode}
            comparingTaskId={parameters.comparingTaskId}
            data={result}
          />
        );
      },
      textItems: [],
    },
    {
      textItems: [
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.Created',
          }),
          //创建人
          task?.creator?.name || '-',
        ],
        [
          formatMessage({
            id: 'odc.TaskManagePage.DataMocker.CreationTime',
          }),
          // 创建时间
          getFormatDateTime(task.createTime),
        ],
      ],
    },
  ];
}
