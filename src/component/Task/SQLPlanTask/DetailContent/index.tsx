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
import { operationTypeMap } from '@/component/Task/component/CommonDetailModal/TaskOperationRecord';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import type { CycleTaskDetail, ISqlPlayJobParameters, TaskOperationType } from '@/d.ts';
import { TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Divider, Space } from 'antd';
import React from 'react';
import { getCronCycle } from '../../component/TaskTable';
import styles from '../../index.less';
import DatabaseLabel from '../../component/DatabaseLabel';

const { Panel } = Collapse;
const ErrorStrategy = {
  ABORT: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.StopATask',
    defaultMessage: '停止任务',
  }), //停止任务
  CONTINUE: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.IgnoreErrorsToContinueThe',
    defaultMessage: '忽略错误继续任务',
  }),
  //忽略错误继续任务
};

const CycleTaskLabel = {
  [TaskType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.PlannedChange',
    defaultMessage: '计划变更',
  }),
  //计划变更
  [TaskType.SQL_PLAN]: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.SqlPlan',
    defaultMessage: 'SQL 计划',
  }),
  //SQL 计划
};

interface IProps {
  task: CycleTaskDetail<ISqlPlayJobParameters>;
  hasFlow: boolean;
  operationType?: TaskOperationType;
  theme?: string;
}

const SqlPlanTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow, operationType, theme } = props;
  const { jobParameters, triggerConfig, allowConcurrent } = task ?? {};
  const executionTimeout = milliSecondsToHour(jobParameters?.timeoutMillis);

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskNumber',
            defaultMessage: '任务编号',
          })}
          /*任务编号*/
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.dataMocker.Database',
            defaultMessage: '所属数据库',
          })}
        >
          <DatabaseLabel database={task?.database} />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.src.component.Task.DataMockerTask.DetailContent.DataSource',
            defaultMessage: '所属数据源',
          })}
        >
          {task?.database?.dataSource?.name || '-'}
        </Descriptions.Item>

        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskType',
            defaultMessage: '任务类型',
          })}
          /*任务类型*/
        >
          {CycleTaskLabel[task?.type]}
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.component.DetailModal.sqlPlan.RiskLevel',
              defaultMessage: '风险等级',
            })}
            /*风险等级*/
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}

        {operationType && (
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.component.DetailModal.sqlPlan.ChangeType',
              defaultMessage: '变更类型',
            })}
            /*变更类型*/
          >
            {operationTypeMap[operationType]}
          </Descriptions.Item>
        )}
      </Descriptions>
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.sqlPlan.SqlContent',
          defaultMessage: 'SQL 内容',
        })}
        /*SQL 内容*/
        content={
          <div style={{ margin: '8px 0' }}>
            <SQLContent
              theme={theme}
              type={task?.type}
              sqlContent={jobParameters?.sqlContent}
              sqlObjectIds={jobParameters?.sqlObjectIds}
              sqlObjectNames={jobParameters?.sqlObjectNames}
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

      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TimingPeriod',
            defaultMessage: '定时周期',
          })}
          /*定时周期*/
        >
          {triggerConfig ? getCronCycle(triggerConfig) : '-'}
        </Descriptions.Item>
        {task?.type === TaskType.SQL_PLAN && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.component.DetailModal.sqlPlan.NextExecutionTime',
                    defaultMessage: '下一次执行时间',
                  })}
                  /*下一次执行时间*/
                  content={
                    <Space>
                      {getFormatDateTime(task.nextFireTimes?.[0])}
                      {isActive ? <UpOutlined /> : <DownOutlined />}
                    </Space>
                  }
                />
              )}
            >
              <Panel key="1" header={null}>
                <Space direction="vertical" size={0}>
                  {task?.nextFireTimes?.map((item, index) => {
                    return index > 0 && <div>{getFormatDateTime(item)}</div>;
                  })}
                </Space>
              </Panel>
            </Collapse>
          </Descriptions.Item>
        )}

        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Separator',
            defaultMessage: '分隔符',
          })}
          /*分隔符*/
        >
          {jobParameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.QueryResultLimits',
            defaultMessage: '查询结果限制',
          })}
          /*查询结果限制*/
        >
          {jobParameters?.queryLimit}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskErrorHandling',
            defaultMessage: '任务错误处理',
          })}
          /*任务错误处理*/
        >
          {ErrorStrategy[jobParameters?.errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionTimeout',
            defaultMessage: '执行超时时间',
          })}
          /*执行超时时间*/
        >
          {
            formatMessage(
              {
                id: 'odc.component.DetailModal.sqlPlan.ExecutiontimeoutHours',
                defaultMessage: '{executionTimeout}小时',
              },

              { executionTimeout },
            )
            //`${executionTimeout}小时`
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionDurationHypercycleProcessing',
            defaultMessage: '执行时长超周期处理',
          })} /*执行时长超周期处理*/
        >
          {
            allowConcurrent
              ? formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.IgnoreTheCurrentTaskStatus',
                  defaultMessage: '忽略当前任务状态，定期发起新任务',
                }) //忽略当前任务状态，定期发起新任务
              : formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.AfterTheCurrentTaskIs',
                  defaultMessage: '待当前任务执行完毕在新周期发起任务',
                }) //待当前任务执行完毕在新周期发起任务
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.SQLPlanTask.DetailContent.Description',
            defaultMessage: '描述',
          })}
          /*描述*/ span={2}
        >
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Founder',
            defaultMessage: '创建人',
          })}
          /*创建人*/
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.CreationTime',
            defaultMessage: '创建时间',
          })}
          /*创建时间*/
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default SqlPlanTaskContent;
