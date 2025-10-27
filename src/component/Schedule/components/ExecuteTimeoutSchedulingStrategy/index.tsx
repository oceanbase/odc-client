import { formatMessage } from '@/util/intl';
import { Form, Radio, Space } from 'antd';
import HelpDoc from '@/component/helpDoc';

export const executeTimeoutStrategyOptions = [
  {
    label: formatMessage({
      id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.E60DE59D',
      defaultMessage: '忽略当前超时任务，发起新任务',
    }),
    value: true,
  },
  {
    label: formatMessage({
      id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.C7F59CD6',
      defaultMessage: '重启当前超时任务',
    }),
    value: false,
  },
];

const ExecuteTimeoutSchedulingStrategy = () => {
  return (
    <Form.Item
      label={
        <>
          <span>
            {formatMessage({
              id: 'src.component.Schedule.components.ExecuteTimeoutSchedulingStrategy.2CDAB267',
              defaultMessage: '执行超时调度策略',
            })}
          </span>
          <HelpDoc leftText isTip doc="ExecutionTimeoutSchedulingStrategy"></HelpDoc>
        </>
      }
      name="scheduleIgnoreTimeoutTask"
      required
    >
      <Radio.Group options={executeTimeoutStrategyOptions} />
    </Form.Item>
  );
};

export default ExecuteTimeoutSchedulingStrategy;
