import { formatMessage } from '@/util/intl';
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
import type { IPartitionPlanParams, ITaskResult, IIPartitionPlanTaskDetail } from '@/d.ts';
import PartitionPolicyTable from '../../component/PartitionPolicyTable';
import { ErrorStrategyMap } from '../../const';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import CycleDescriptionItem from './CycleDescriptionItem';
import { Divider, Descriptions, Typography } from 'antd';
import DatabaseLabel from '../../component/DatabaseLabel';
import React from 'react';

const { Text } = Typography;

interface IProps {
  task: IIPartitionPlanTaskDetail<IPartitionPlanParams>;
  result: ITaskResult;
  hasFlow: boolean;
}

const PartitionTaskContent: React.FC<IProps> = (props) => {
  const { task, hasFlow } = props;
  const {
    creationTrigger,
    createTriggerNextFireTimes,
    droppingTrigger,
    dropTriggerNextFireTimes,
    errorStrategy,
    timeoutMillis,
  } = task?.parameters ?? {};
  const executionTimeout = milliSecondsToHour(timeoutMillis);

  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.TaskNumber',
              defaultMessage: '任务编号',
            }) /* 任务编号 */
          }
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Type',
              defaultMessage: '任务类型',
            }) /* 任务类型 */
          }
        >
          {
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Partition',
              defaultMessage: '分区计划',
            }) /* 
          分区计划
          */
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.F74A95F4',
              defaultMessage: '数据库',
            }) /*"数据库"*/
          }
        >
          <DatabaseLabel database={task?.database} />
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.3C90D5CA',
              defaultMessage: '所属数据源',
            }) /*"所属数据源"*/
          }
        >
          {task?.database?.dataSource?.name || '-'}
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.PartitionTask.DetailContent.RiskLevel',
                defaultMessage: '风险等级',
              }) /* 风险等级 */
            }
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <PartitionPolicyTable taskId={task?.id} />
      {creationTrigger && (
        <CycleDescriptionItem
          triggerConfig={creationTrigger}
          nextFireTimes={createTriggerNextFireTimes}
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.5FC1C8E8',
              defaultMessage: '创建策略执行周期',
            }) /*"创建策略执行周期"*/
          }
        />
      )}

      {droppingTrigger && (
        <CycleDescriptionItem
          triggerConfig={droppingTrigger}
          nextFireTimes={dropTriggerNextFireTimes}
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.380BE45E',
              defaultMessage: '删除策略执行周期',
            }) /*"删除策略执行周期"*/
          }
        />
      )}

      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.63D30920',
              defaultMessage: '任务错误处理',
            }) /*"任务错误处理"*/
          }
        >
          {ErrorStrategyMap[errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'src.component.Task.PartitionTask.DetailContent.477F07A5',
              defaultMessage: '执行超时时间',
            }) /*"执行超时时间"*/
          }
        >
          {executionTimeout || '-'}
          {formatMessage({
            id: 'src.component.Task.PartitionTask.DetailContent.B08D0E80' /*小时*/,
            defaultMessage: '小时',
          })}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Remark',
              defaultMessage: '备注',
            }) /* 备注 */
          }
        >
          {task?.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 4 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Founder',
              defaultMessage: '创建人',
            }) /* 创建人 */
          }
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.CreationTime',
              defaultMessage: '创建时间',
            }) /* 创建时间 */
          }
        >
          {getFormatDateTime(task.createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default PartitionTaskContent;
