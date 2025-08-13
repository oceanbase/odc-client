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
import RuleConfigTable from '@/component/Task/modals/DataMockerTask/CreateModal/RuleConfigTable';
import { convertServerColumnsToFormColumns } from '@/component/Task/modals/DataMockerTask/CreateModal/RuleContent';
import { MockStrategyTextMap } from '@/component/Task/modals/DataMockerTask/CreateModal/type';
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
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { ODCRiskLevelLabel } from '@/component/RiskLevelLabel';
import { getTaskExecStrategyMap } from '@/component/Task/const';
import EllipsisText from '@/component/EllipsisText';
export function getItems(task: TaskDetail<IMockDataParams>, result: ITaskResult, hasFlow: boolean) {
  if (!task) {
    return [];
  }
  const {
    id,
    parameters: { taskDetail },
    status,
    database,
  } = task;
  const taskDetailObj: {
    tables: IServerMockTable;
  } = JSON.parse(taskDetail);
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const taskDbMode = database?.dataSource?.dialectType;
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
                id: 'odc.component.DetailModal.dataMocker.ExecutionMethod',
                defaultMessage: '执行方式',
              }),
              //执行方式
              taskExecStrategyMap[task?.executionStrategy],
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.TargetTable',
                defaultMessage: '目标表',
              }),
              // 目标表
              table.tableName,
              2,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.SimulateTheGeneratedDataVolume',
                defaultMessage: '模拟生成数据量',
              }),
              // 模拟生成数据量
              table.totalCount,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.BatchSize',
                defaultMessage: '批处理大小',
              }),
              // 批处理大小
              table.batchSize,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ClearTheTableBeforeInserting',
                defaultMessage: '插入模拟数据前清空表',
              }),
              // 插入模拟数据前清空表
              table.whetherTruncate
                ? formatMessage({
                    id: 'odc.TaskManagePage.DataMocker.Is',
                    defaultMessage: '是',
                  }) // 是
                : formatMessage({
                    id: 'odc.TaskManagePage.DataMocker.No',
                    defaultMessage: '否',
                  }), // 否
            ],
            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.DataConflictHandlingMethod',
                defaultMessage: '数据冲突处理方式',
              }),
              // 数据冲突处理方式
              MockStrategyTextMap[table.strategy],
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ActualInsertRecord',
                defaultMessage: '实际插入记录',
              }),
              // 实际插入记录
              result?.writeCount,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ConflictRecords',
                defaultMessage: '冲突记录',
              }),
              // 冲突记录
              result?.conflictCount,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.IgnoreInsert',
                defaultMessage: '忽略插入',
              }),
              // 忽略插入
              result?.ignoreCount,
            ],

            [
              formatMessage({
                id: 'odc.TaskManagePage.DataMocker.ClearRecords',
                defaultMessage: '清除记录',
              }),
              // 清除记录
              result?.clearCount,
            ],

            [
              formatMessage({
                id: 'odc.DataMockerTask.DetailContent.Description',
                defaultMessage: '描述',
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
              defaultMessage: '规则设置展示',
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
        ['ID', task?.id],
        [
          '类型',
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.AnalogData',
            defaultMessage: '模拟数据',
          }),
        ],
        ['数据库', <DatabaseLabel database={task?.database} />],

        ['数据源', <EllipsisText content={task?.database?.dataSource?.name} />],
        ['项目', <EllipsisText content={task?.project?.name} />],
      ],
    },
    taskDetailItems,
    columnsItems,
    {
      textItems: [
        [
          formatMessage({
            id: 'odc.component.DetailModal.dataMocker.Created',
            defaultMessage: '创建人',
          }),
          //创建人
          task?.creator?.name || '-',
        ],

        [
          formatMessage({
            id: 'odc.TaskManagePage.DataMocker.CreationTime',
            defaultMessage: '创建时间',
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
        defaultMessage: '执行时间',
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
          defaultMessage: '风险等级',
        }),
        //风险等级
        <ODCRiskLevelLabel iconMode level={task?.riskLevel?.level} levelMap />,
      ],
    ];

    flowInfo.forEach((item) => {
      res[0].textItems.push(item);
    });
  }
  return res;
}
