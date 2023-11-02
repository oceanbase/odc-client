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
import { getTaskExecStrategyMap } from '@/component/Task';
import RuleConfigTable from '@/component/Task/DataMockerTask/CreateModal/RuleConfigTable';
import { convertServerColumnsToFormColumns } from '@/component/Task/DataMockerTask/CreateModal/RuleContent';
import { MockStrategyTextMap } from '@/component/Task/DataMockerTask/CreateModal/type';
import {
  IMockDataParams,
  IServerMockTable,
  ITaskResult,
  TaskDetail,
  TaskExecStrategy,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import Form from 'antd/lib/form/Form';
export function getItems(task: TaskDetail<IMockDataParams>, result: ITaskResult, hasFlow: boolean) {
  if (!task) {
    return [];
  }
  const {
    id,
    parameters: { taskDetail },
    status,
    connection,
  } = task;
  const taskDetailObj: {
    tables: IServerMockTable;
  } = JSON.parse(taskDetail);
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const taskDbMode = connection?.dbMode;
  let taskDetailItems;
  let columnsItems;
  let schemaName;
  try {
    if (taskDetail) {
      const table = taskDetailObj?.tables?.[0];
      if (table) {
        schemaName = table.schemaName;
        taskDetailItems = {
          textItems: [
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.TargetTable',
              }),
              // 目标表
              table.tableName,
              2,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.SimulateTheGeneratedDataVolume',
              }),
              // 模拟生成数据量
              table.totalCount,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.BatchSize',
              }),
              // 批处理大小
              table.batchSize,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ClearTheTableBeforeInserting',
              }),
              // 插入模拟数据前清空表
              table.whetherTruncate
                ? formatMessage({
                    id: 'odc.TaskManagePage.DataMocker.Is',
                  }) // 是
                : formatMessage({
                    id: 'odc.TaskManagePage.DataMocker.No',
                  }), // 否
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.DataConflictHandlingMethod',
              }),
              // 数据冲突处理方式
              MockStrategyTextMap[table.strategy],
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ActualInsertRecord',
              }),
              // 实际插入记录
              result?.writeCount,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ConflictRecords',
              }),
              // 冲突记录
              result?.conflictCount,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.IgnoreInsert',
              }),
              // 忽略插入
              result?.ignoreCount,
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ClearRecords',
              }),
              // 清除记录
              result?.clearCount,
            ],
            [
              formatMessage({
                id: 'odc.DataMockerTask.DetailContent.Description',
              }),
              //描述
              task?.description || '-',
            ],
          ],
        };
        const { columns } = table;
        if (columns?.length) {
          columnsItems = {
            sectionName: formatMessage({
              id: 'odc.TaskManagePage.DataMocker.RuleSettings',
            }),
            // 规则设置展示
            textItems: [],
            sectionRender: (task: TaskDetail<IMockDataParams>) => {
              const tableColumns = convertServerColumnsToFormColumns(columns, taskDbMode);
              return (
                <Form
                  key={id + status}
                  initialValues={{
                    columns: tableColumns,
                  }}
                >
                  <RuleConfigTable dbMode={taskDbMode} readonly value={tableColumns} />
                </Form>
              );
            },
          };
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  const res: {
    sectionName?: string;
    textItems: any[];
    /**
     * 自定义渲染逻辑
     */
    sectionRender?: (task: TaskDetail<IMockDataParams>) => void;
  }[] = [
    {
      textItems: [
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.TaskNo',
          }),
          //任务编号
          task?.id,
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
            id: 'odc.src.component.Task.DataMockerTask.DetailContent.DataSource',
          }), //'所属数据源'
          task?.connection?.name || '-',
        ],
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.TaskType',
          }),
          //任务类型
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.AnalogData',
          }),

          //模拟数据
        ],
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.ExecutionMethod',
          }),
          //执行方式
          taskExecStrategyMap[task?.executionStrategy],
        ],
      ],
    },
    taskDetailItems,
    columnsItems,
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
  ].filter(Boolean);
  if (task?.executionStrategy === TaskExecStrategy.TIMER) {
    res[0].textItems.push([
      formatMessage({
        id: 'odc.component.DetailModal.dataMocker.ExecutionTime',
      }),
      //执行时间
      getFormatDateTime(task?.executionTime),
    ]);
  }
  if (hasFlow) {
    const riskLevel = task?.riskLevel;
    const flowInfo = [
      [
        formatMessage({
          id: 'odc.component.DetailModal.dataMocker.RiskLevel',
        }),
        //风险等级
        <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />,
      ],
    ];
    flowInfo.forEach((item) => {
      res[0].textItems.push(item);
    });
  }
  return res;
}
