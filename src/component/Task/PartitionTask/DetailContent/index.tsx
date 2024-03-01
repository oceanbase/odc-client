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
import { Divider, Descriptions, Space, Typography } from 'antd';
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
            }) /* 任务编号 */
          }
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Type',
            }) /* 任务类型 */
          }
        >
          {
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Partition',
            }) /* 
          分区计划
         */
          }
        </Descriptions.Item>
        <Descriptions.Item label="数据库">
          <Space size={2}>
            <span>{task?.database?.name || '-'}</span>
            <Text type="secondary">{task?.database?.dataSource?.name}</Text>
          </Space>
        </Descriptions.Item>
        {hasFlow && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.PartitionTask.DetailContent.RiskLevel',
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
          label="创建策略执行周期"
        />
      )}
      {droppingTrigger && (
        <CycleDescriptionItem
          triggerConfig={droppingTrigger}
          nextFireTimes={dropTriggerNextFireTimes}
          label="删除策略执行周期"
        />
      )}
      <Descriptions column={2}>
        <Descriptions.Item label="任务错误处理">
          {ErrorStrategyMap[errorStrategy]}
        </Descriptions.Item>
        <Descriptions.Item label="执行超时时间">{executionTimeout || '-'}小时</Descriptions.Item>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.Remark',
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
            }) /* 创建人 */
          }
        >
          {task?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.CreationTime',
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
