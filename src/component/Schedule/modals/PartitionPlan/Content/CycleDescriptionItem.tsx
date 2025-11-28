import { formatMessage } from '@/util/intl';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { getCronCycle } from '@/component/Task/component/TaskTable/utils';
import type { ICycleTaskTriggerConfig } from '@/d.ts';
import { getFormatDateTime } from '@/util/data/dateTime';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Collapse, Descriptions, Space } from 'antd';
import React from 'react';
import styles from './index.less';
const { Panel } = Collapse;

interface IProps {
  label: string;
  triggerConfig: ICycleTaskTriggerConfig;
  nextFireTimes: number[];
}

const CycleDescriptionItem: React.FC<IProps> = (props) => {
  const { label, triggerConfig, nextFireTimes } = props;

  return (
    <Descriptions column={2}>
      <Descriptions.Item label={label}>
        {triggerConfig ? getCronCycle(triggerConfig) : '-'}
      </Descriptions.Item>
      <Descriptions.Item>
        <Collapse
          ghost
          bordered={false}
          className={styles['next-time']}
          expandIcon={({ isActive }) => (
            <SimpleTextItem
              label={
                formatMessage({
                  id: 'src.component.Task.PartitionTask.DetailContent.9E174828',
                  defaultMessage: '下一次执行时间',
                }) /*"下一次执行时间"*/
              }
              content={
                <Space>
                  {getFormatDateTime(nextFireTimes?.[0])}
                  {isActive ? <UpOutlined /> : <DownOutlined />}
                </Space>
              }
            />
          )}
        >
          <Panel key="1" header={null}>
            <Space direction="vertical" size={0}>
              {nextFireTimes?.map((item, index) => {
                return index > 0 && <div>{getFormatDateTime(item)}</div>;
              })}
            </Space>
          </Panel>
        </Collapse>
      </Descriptions.Item>
    </Descriptions>
  );
};
export default CycleDescriptionItem;
