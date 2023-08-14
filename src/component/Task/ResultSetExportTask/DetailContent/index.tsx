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
import { SQLContent } from '@/component/SQLContent';
import { getTaskExecStrategyMap } from '@/component/Task';
import type { IResultSetExportTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { ConnectionMode, TaskExecStrategy } from '@/d.ts';
import { getFormatDateTime } from '@/util/utils';
import { Divider } from 'antd';
import { SimpleTextItem } from '../../component/SimpleTextItem';

export const getItems = (
  _task: TaskDetail<IResultSetExportTaskParams>,
  result: ITaskResult,
  hasFlow: boolean,
) => {
  if (!_task) {
    return [];
  }
  const isMySQL = _task?.connection?.dbMode === ConnectionMode.OB_MYSQL;
  const taskExecStrategyMap = getTaskExecStrategyMap(_task?.type);

  const res: {
    sectionName?: string;
    textItems: [string, string | number, number?][];
    sectionRender?: (task: TaskDetail<IResultSetExportTaskParams>) => void;
  }[] = [
    {
      textItems: [],
      sectionRender: (task: TaskDetail<IResultSetExportTaskParams>) => {
        const parameters = task?.parameters;
        const riskLevel = task?.riskLevel;
        const csvFormat = [];
        if (parameters?.csvFormat?.isContainColumnHeader) {
          csvFormat.push('包含列头');
        }
        if (parameters?.csvFormat?.isTransferEmptyString) {
          csvFormat.push('空字符串转为空值');
        }
        return (
          <>
            <SimpleTextItem label="任务编号" content={task?.id} />
            <SimpleTextItem label="所属数据库" content={task?.databaseName || '-'} />
            <SimpleTextItem label="任务类型" content="导出结果集" />
            {hasFlow && (
              <SimpleTextItem
                label="风险等级"
                content={<RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />}
              />
            )}

            <SimpleTextItem
              label="SQL 内容"
              content={
                <div style={{ marginTop: '8px' }}>
                  <SQLContent
                    sqlContent={parameters?.sql}
                    sqlObjectIds={null}
                    sqlObjectNames={null}
                    taskId={task?.id}
                    isMySQL={isMySQL}
                  />
                </div>
              }
              direction="column"
            />

            <SimpleTextItem label="查询结果限制" content={parameters?.maxRows} />
            <SimpleTextItem label="文件名" content={parameters?.fileName} />
            <SimpleTextItem label="文件编码" content={parameters?.fileEncoding} />
            <SimpleTextItem label="CSV 文件设置" content={csvFormat?.join('、')} />
            <SimpleTextItem label="字段分隔符" content={parameters?.csvFormat?.columnSeparator} />
            <SimpleTextItem label="文本识别符" content={parameters?.csvFormat?.columnDelimiter} />
            <SimpleTextItem label="换行符号" content={parameters?.csvFormat?.lineSeparator} />
            <SimpleTextItem
              label="执行方式"
              content={taskExecStrategyMap[task?.executionStrategy]}
            />

            {task?.executionStrategy === TaskExecStrategy.TIMER && (
              <SimpleTextItem label="执行时间" content={getFormatDateTime(task?.executionTime)} />
            )}

            <SimpleTextItem label="任务描述" content={task?.description} direction="column" />

            <Divider style={{ marginTop: 4 }} />
            <SimpleTextItem label="创建人" content={task?.creator?.name || '-'} />

            <SimpleTextItem label="创建时间" content={getFormatDateTime(task?.createTime)} />
          </>
        );
      },
    },
  ].filter(Boolean);
  return res;
};
