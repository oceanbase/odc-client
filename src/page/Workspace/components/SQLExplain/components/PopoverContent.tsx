import { Descriptions } from 'antd';
import styles from './index.less';

const PopoverContent = ({ node }) => {
  return (
    <div className={styles.popoverContent}>
      <Descriptions column={1}>
        <Descriptions.Item label={'traceId'}>{node?.traceId}</Descriptions.Item>
        <Descriptions.Item label={'spanId'}>{node?.spanId}</Descriptions.Item>
        <Descriptions.Item label={'开始时间'}>{node?.originStartTimestamp}</Descriptions.Item>
        <Descriptions.Item label={'结束时间'}>{node?.originEndTimestamp}</Descriptions.Item>
        <Descriptions.Item label={'耗时'}>
          {node?.endTimestamp - node?.startTimestamp}us
        </Descriptions.Item>
      </Descriptions>
      <div>
        <div>Tags</div>
        <Descriptions column={1}>
          <Descriptions.Item label={'SQL Trace ID'}>{node?.logTraceId}</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default PopoverContent;
