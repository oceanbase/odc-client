import { formatMessage } from '@/util/intl';
import { Segmented, Space } from 'antd';
import { IScheduleRecord, IPartitionPlan } from '@/d.ts/schedule';
import React, { useEffect, useState } from 'react';
import { ICycleTaskTriggerConfig } from '@/d.ts';
import ExecutionInfoContainer from '@/component/Schedule/components/ExecutionInfoContainer';
import styles from '../index.less';
export enum PartitionTypeExecutionMethod {
  /** 创建分区 */
  CreatePartition = 'CreatePartition',
  /** 删除分区 */
  DropPartition = 'DropPartition',
}

interface IProps {
  schedule: IScheduleRecord<IPartitionPlan>;
  lastExecuteTime: number;
  onTabChange?: (type: PartitionTypeExecutionMethod) => void;
}
const PartitionPlanHeader: React.FC<IProps> = (props) => {
  const { schedule, lastExecuteTime, onTabChange } = props;
  const [type, setType] = useState<PartitionTypeExecutionMethod>(
    PartitionTypeExecutionMethod.CreatePartition,
  );
  const [trigger, setTrigger] = useState<ICycleTaskTriggerConfig>(schedule?.triggerConfig);
  const [fireTimes, setFireTimes] = useState<number[]>(schedule?.nextFireTimes || []);

  useEffect(() => {
    if (type === PartitionTypeExecutionMethod.CreatePartition) {
      setTrigger(schedule?.triggerConfig);
      setFireTimes(schedule?.nextFireTimes || []);
    } else {
      setTrigger(schedule?.parameters?.droppingTrigger);
      setFireTimes(schedule?.parameters?.dropTriggerNextFireTimes || []);
    }
  }, [type]);

  return (
    <div>
      {schedule.parameters.droppingTrigger && (
        <Segmented
          value={type}
          onChange={(value) => {
            setType(value);
            onTabChange?.(value);
          }}
          style={{ marginBottom: '6px' }}
          options={[
            {
              value: PartitionTypeExecutionMethod.CreatePartition,
              label: (
                <span
                  style={
                    type === PartitionTypeExecutionMethod.CreatePartition
                      ? { color: 'var(--icon-blue-color)' }
                      : {}
                  }
                >
                  {formatMessage({
                    id: 'src.component.Schedule.components.OperationRecord.components.DB6188CA',
                    defaultMessage: '创建分区调度策略',
                  })}
                </span>
              ),
            },
            {
              value: PartitionTypeExecutionMethod.DropPartition,
              label: (
                <span
                  style={
                    type === PartitionTypeExecutionMethod.DropPartition
                      ? { color: 'var(--icon-blue-color)' }
                      : {}
                  }
                >
                  {formatMessage({
                    id: 'src.component.Schedule.components.OperationRecord.components.C12F3E2D',
                    defaultMessage: '删除分区调度策略',
                  })}
                </span>
              ),
            },
          ]}
        />
      )}
      <Space className={styles.infoContainer}>
        <ExecutionInfoContainer
          trigger={trigger}
          fireTimes={fireTimes}
          type={schedule?.type}
          useStyleContainer={false}
          lastExecuteTime={lastExecuteTime}
        />
      </Space>
    </div>
  );
};

export default PartitionPlanHeader;
