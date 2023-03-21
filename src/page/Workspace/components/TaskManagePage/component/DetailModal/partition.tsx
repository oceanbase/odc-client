import { SimpleTextItem } from '@/component/AsyncTaskModal/components';
import type { IPartitionPlanParams, IPartitionPlanRecord, ITaskResult, TaskDetail } from '@/d.ts';
import { TaskNodeStatus, TaskStatus } from '@/d.ts';
import {
  enabledInspectTriggerStrategy,
  inspectOptions,
} from '@/page/Workspace/components/PartitionDrawer';
import PartitionPolicyTable from '@/page/Workspace/components/PartitionPolicyTable';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Col, Divider, Row } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IProps {
  userStore?: UserStore;
  task: TaskDetail<IPartitionPlanParams>;
  result: ITaskResult;
  hasFlow: boolean;
  partitionPlans: IPartitionPlanRecord[];
  onPartitionPlansChange: (value: IPartitionPlanRecord[]) => void;
}

const PartitionTaskContent: React.FC<IProps> = (props) => {
  const {
    userStore: { user },
    task,
    result,
    hasFlow,
    partitionPlans,
    onPartitionPlansChange,
  } = props;
  const confirmNode =
    task?.status === TaskStatus.WAIT_FOR_CONFIRM
      ? task.nodeList.find((node) => node.status === TaskNodeStatus.WAIT_FOR_CONFIRM)
      : null;
  const enabledEdit = confirmNode?.candidates?.some((item) => item.id === user?.id) ?? false;

  const inspectTriggerStrategyLabel = inspectOptions?.find(
    (item) => item.value === task?.parameters?.connectionPartitionPlan?.inspectTriggerStrategy,
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
      <Row>
        <Col span={12}>
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.component.DetailModal.partition.TaskNumber',
            })}
            /*任务编号*/ content={task?.id}
          />
        </Col>
        <Col span={12}>
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.component.DetailModal.partition.TaskType',
            })}
            /*任务类型*/ content={
              formatMessage({
                id: 'odc.component.DetailModal.partition.PartitionPlan',
              }) //分区计划
            }
          />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.component.DetailModal.partition.Connection',
            })}
            /*所属连接*/ content={task?.connection?.name || '-'}
          />
        </Col>
        {enabledInspectTriggerStrategy && (
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.partition.InspectionCycle',
              })}
              /*巡检周期*/ content={inspectTriggerStrategyLabel}
            />
          </Col>
        )}
      </Row>
      {hasFlow && (
        <SimpleTextItem
          label={formatMessage({
            id: 'odc.component.DetailModal.partition.RiskLevel',
          })}
          /*风险等级*/ content={task?.maxRiskLevel}
        />
      )}
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.partition.Remarks',
        })}
        /*备注*/ content={task?.description || '-'}
      />
      <Divider style={{ marginTop: 4 }} />
      <PartitionPolicyTable
        enabledEdit={enabledEdit}
        enabledFilter={false}
        partitionPlans={partitionPlans}
        onPlansConfigChange={handlePlansConfigChange}
      />

      <Divider style={{ marginTop: 4 }} />
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.partition.Founder',
        })}
        /*创建人*/ content={task?.creator?.name || '-'}
      />
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.partition.CreationTime',
        })}
        /*创建时间*/ content={getFormatDateTime(task.createTime)}
      />
    </>
  );
};

export default inject('userStore')(observer(PartitionTaskContent));
