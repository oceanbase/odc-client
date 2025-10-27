import { ICycleTaskTriggerConfig, TaskExecStrategy } from '@/d.ts';
import { Descriptions, Collapse, Space } from 'antd';
import { isCycleTriggerStrategy } from '@/component/Task/helper';
import { formatMessage } from '@/util/intl';
import { getScheduleExecStrategyMap } from '@/component/Schedule/helper';
import { ScheduleType } from '@/d.ts/schedule';
import React, { useMemo } from 'react';
import { getCronCycle } from '@/component/Task/component/TaskTable/utils';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getFormatDateTime, getLocalFormatDateTime } from '@/util/utils';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
const { Panel } = Collapse;

interface ExecutionInfoContainer {
  trigger: ICycleTaskTriggerConfig;
  fireTimes?: number[];
  type: ScheduleType;
  useStyleContainer?: boolean;
  lastExecuteTime: number;
}

const ExecutionInfoContainer: React.FC<ExecutionInfoContainer> = (props) => {
  const { trigger, fireTimes, type, lastExecuteTime, useStyleContainer = true } = props;
  const scheduleExecStrategyMap = getScheduleExecStrategyMap(type);

  const isCycle = useMemo(() => {
    return isCycleTriggerStrategy(trigger?.triggerStrategy);
  }, [trigger?.triggerStrategy]);

  return (
    <Space className={useStyleContainer ? styles.infoContainer : undefined}>
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.DataClearTask.DetailContent.ExecutionMethod',
            defaultMessage: '执行方式',
          })}
        >
          {scheduleExecStrategyMap?.[trigger?.triggerStrategy]}
        </Descriptions.Item>
        {trigger?.triggerStrategy === TaskExecStrategy.START_AT && (
          <Descriptions.Item
            label={
              formatMessage({
                id: 'src.component.Task.DataArchiveTask.DetailContent.074676BE',
                defaultMessage: '执行时间',
              }) /*"执行时间"*/
            }
          >
            {getLocalFormatDateTime(trigger?.startAt)}
          </Descriptions.Item>
        )}
        {isCycle && (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Schedule.components.ExecutionInfoContainer.4422CD46',
              defaultMessage: '执行周期',
            })}
          >
            <span>{getCronCycle(trigger)}</span>
          </Descriptions.Item>
        )}
        {isCycle && (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Schedule.components.ExecutionInfoContainer.F9AB95B0',
              defaultMessage: '最近执行时间',
            })}
          >
            <span>{lastExecuteTime ? getFormatDateTime(lastExecuteTime) : '-'}</span>
          </Descriptions.Item>
        )}
        {isCycle && (
          <Descriptions.Item>
            <Collapse
              ghost
              bordered={false}
              className={styles.nextTime}
              expandIcon={({ isActive }) => (
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.DataClearTask.DetailContent.NextExecutionTime',
                    defaultMessage: '下一次执行时间',
                  })}
                  /*下一次执行时间*/ content={
                    <Space>
                      {getFormatDateTime(fireTimes?.[0])}
                      {isActive ? <UpOutlined /> : <DownOutlined />}
                    </Space>
                  }
                />
              )}
            >
              <Panel key="1" header={null}>
                <Space direction="vertical" size={0}>
                  {fireTimes?.map((item, index) => {
                    return index > 0 && <div>{getFormatDateTime(item)}</div>;
                  })}
                </Space>
              </Panel>
            </Collapse>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Space>
  );
};

export default ExecutionInfoContainer;
