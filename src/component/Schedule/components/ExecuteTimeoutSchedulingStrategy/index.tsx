import { Form, Radio, Space } from 'antd';
import HelpDoc from '@/component/helpDoc';

export const executeTimeoutStrategyOptions = [
  {
    label: '忽略当前超时任务，发起新任务',
    value: true,
  },
  {
    label: '重启当前超时任务',
    value: false,
  },
];

const ExecuteTimeoutSchedulingStrategy = () => {
  return (
    <Form.Item
      label={
        <>
          <span>执行超时调度策略</span>
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
