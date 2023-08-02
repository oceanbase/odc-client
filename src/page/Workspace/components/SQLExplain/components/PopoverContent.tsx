import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import { Descriptions } from 'antd';
import BigNumber from 'bignumber.js';
import styles from './index.less';

const PopoverContent = ({ node }) => {
  return (
    <div className={styles.popoverContent}>
      <Descriptions column={1}>
        <Descriptions.Item label={'traceId'}>{node?.traceId}</Descriptions.Item>
        <Descriptions.Item label={'spanId'}>{node?.spanId}</Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.StartTime' }) //开始时间
          }
        >
          {node?.originStartTimestamp}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.EndTime' }) //结束时间
          }
        >
          {node?.originEndTimestamp}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            formatMessage({ id: 'odc.SQLExplain.components.PopoverContent.TimeConsuming' }) //耗时
          }
        >
          {formatTimeTemplate(
            BigNumber(node?.endTimestamp - node?.startTimestamp)
              .div(1000000)
              .toNumber(),
          )}
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
