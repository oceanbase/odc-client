import { Segmented, Space } from 'antd';
import { IScheduleRecord, IPartitionPlan } from '@/d.ts/schedule';
import React, { useEffect, useState } from 'react';
import { ICycleTaskTriggerConfig } from '@/d.ts';
import ExecutionInfoContainer from '@/component/Schedule/components/ExecutionInfoContainer';
import styles from '../index.less';

enum PartitionTypeExecutionMethod {
  /** 创建分区 */
  CreatePartition = 'CreatePartition',
  /** 删除分区 */
  DropPartition = 'DropPartition',
}

interface IProps {
  schedule: IScheduleRecord<IPartitionPlan>;
  lastExecuteTime: number;
}
const PartitionPlanHeader: React.FC<IProps> = (props) => {
  const { schedule, lastExecuteTime } = props;
  const [type, setType] = useState<PartitionTypeExecutionMethod>(
    PartitionTypeExecutionMethod.CreatePartition,
  );
  const [trigger, setTrigger] = useState<ICycleTaskTriggerConfig>(
    schedule?.parameters?.creationTrigger,
  );
  const [fireTimes, setFireTimes] = useState<number[]>(
    schedule?.parameters?.createTriggerNextFireTimes || [],
  );

  useEffect(() => {
    if (type === PartitionTypeExecutionMethod.CreatePartition) {
      setTrigger(schedule?.parameters?.creationTrigger);
      setFireTimes(schedule?.parameters?.createTriggerNextFireTimes || []);
    } else {
      setTrigger(schedule?.parameters?.droppingTrigger);
      setFireTimes(schedule?.parameters?.dropTriggerNextFireTimes || []);
    }
  }, [type]);

  return (
    <Space className={styles.infoContainer}>
      {schedule.parameters.droppingTrigger && (
        <Segmented
          value={type}
          onChange={(value) => {
            setType(value);
          }}
          className={styles.segmented}
          options={[
            {
              value: PartitionTypeExecutionMethod.CreatePartition,
              label: '创建分区调度策略',
            },
            {
              value: PartitionTypeExecutionMethod.DropPartition,
              label: '删除分区调度策略',
            },
          ]}
        />
      )}

      <ExecutionInfoContainer
        trigger={trigger}
        fireTimes={fireTimes}
        type={schedule?.type}
        useStyleContainer={false}
        lastExecuteTime={lastExecuteTime}
      />
    </Space>
  );
};

export default PartitionPlanHeader;
