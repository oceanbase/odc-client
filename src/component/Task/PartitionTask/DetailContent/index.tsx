/*
 * Copyright 2024 OceanBase
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
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import {
  enabledInspectTriggerStrategy,
  inspectOptions,
} from '@/component/Task/PartitionTask/CreateModal';
import { getTaskExecStrategyMap } from '@/component/Task';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import type {
  IPartitionPlanParams,
  IPartitionPlanRecord,
  ITaskResult,
  IIPartitionPlanTaskDetail,
} from '@/d.ts';
import { TaskNodeStatus, TaskStatus } from '@/d.ts';
import PartitionPolicyTable from '@/page/Workspace/components/PartitionPolicyTable';
import type { UserStore } from '@/store/login';
import { getFormatDateTime } from '@/util/utils';
import { Collapse, Divider, Descriptions, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
const { Panel } = Collapse;
interface IProps {
  userStore?: UserStore;
  task: IIPartitionPlanTaskDetail<IPartitionPlanParams>;
  result: ITaskResult;
  hasFlow: boolean;
  partitionPlans: IPartitionPlanRecord[];
  onPartitionPlansChange: (value: IPartitionPlanRecord[]) => void;
}
const ShowNextFireTimes = false;
const PartitionTaskContent: React.FC<IProps> = (props) => {
  const {
    userStore: { user },
    task,
    hasFlow,
    partitionPlans,
    onPartitionPlansChange,
  } = props;
  const confirmNode =
    task?.status === TaskStatus.WAIT_FOR_CONFIRM
      ? task.nodeList.find((node) => node.status === TaskNodeStatus.WAIT_FOR_CONFIRM)
      : null;
  const enabledEdit = confirmNode?.candidates?.some((item) => item.id === user?.id) ?? false;
  const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
  const { connectionPartitionPlan } = task?.parameters ?? {};
  const { triggerConfig } = connectionPartitionPlan ?? {};
  const isCycleStrategy = isCycleTriggerStrategy(
    connectionPartitionPlan?.triggerConfig?.triggerStrategy,
  );
  const inspectTriggerStrategyLabel = inspectOptions?.find(
    (item) => item.value === connectionPartitionPlan?.inspectTriggerStrategy,
  )?.label;
  const handlePlansConfigChange = (values: IPartitionPlanRecord[]) => {
    const newPartitionPlans = partitionPlans?.map((item) => {
      const planValue = values.find((value) => value.id === item.id);
      return planValue ? planValue : item;
    });
    onPartitionPlansChange(newPartitionPlans);
  };
  return (
    <>
      <Descriptions column={2}>
        <Descriptions.Item
          span={2}
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.TaskNumber',
            }) /* 任务编号 */
          }
        >
          {task?.id}
        </Descriptions.Item>
        <Descriptions.Item
          span={2}
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
        {hasFlow && (
          <Descriptions.Item
            span={2}
            label={
              formatMessage({
                id: 'odc.src.component.Task.PartitionTask.DetailContent.RiskLevel',
              }) /* 风险等级 */
            }
          >
            <RiskLevelLabel level={task?.riskLevel?.level} color={task?.riskLevel?.style} />
          </Descriptions.Item>
        )}
        {enabledInspectTriggerStrategy && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'odc.src.component.Task.PartitionTask.DetailContent.InspectionCycle',
              }) /* 巡检周期 */
            }
            span={2}
          >
            {inspectTriggerStrategyLabel}
          </Descriptions.Item>
        )}
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
      <Divider
        style={{
          marginTop: 4,
        }}
      />
      <PartitionPolicyTable
        enabledEdit={enabledEdit}
        enabledFilter={false}
        partitionPlans={partitionPlans}
        onPlansConfigChange={handlePlansConfigChange}
      />
      <Descriptions column={2}>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.ImplementationModalities',
            }) /* 执行方式 */
          }
        >
          {taskExecStrategyMap[triggerConfig?.triggerStrategy]}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({
              id: 'odc.src.component.Task.PartitionTask.DetailContent.ExecutiveStrategy',
            }) /* 执行策略 */
          }
        >
          {triggerConfig?.cronExpression}
        </Descriptions.Item>
        {ShowNextFireTimes && isCycleStrategy && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles['next-time']}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={
                    formatMessage({
                      id: 'odc.src.component.Task.PartitionTask.DetailContent.NextExecutionTime',
                    }) /* 下一次执行时间 */
                  }
                  content={
                    <Space>
                      {getFormatDateTime(task?.nextFireTimes?.[0])}
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
      </Descriptions>
      <Divider
        style={{
          marginTop: 4,
        }}
      />
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
export default inject('userStore')(observer(PartitionTaskContent));
