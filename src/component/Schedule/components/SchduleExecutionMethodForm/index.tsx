import { DatePicker, Form } from 'antd';
import { formatMessage } from '@/util/intl';
import { TaskExecStrategy } from '@/d.ts';
import { Radio } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import Crontab from '@/component/Crontab';
import { disabledDate, disabledTime } from '@/util/utils';
import { forwardRef } from 'react';
import { ICrontab } from '@/component/Crontab/interface';
import ExecuteFailTip from '@/component/Task/component/ExecuteFailTip';

interface TriggerStrategyFormProps {
  crontab?: ICrontab;
  handleCrontabChange?: (value: ICrontab) => void;
}

const SchduleExecutionMethodForm = forwardRef<
  {
    setValue: (value: ICrontab) => void;
    resetFields: () => void;
  },
  TriggerStrategyFormProps
>((props, ref) => {
  const { crontab, handleCrontabChange } = props;

  return (
    <>
      <Form.Item name="triggerStrategy" required>
        <Radio.Group>
          <Radio.Button value={TaskExecStrategy.TIMER}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.PeriodicExecution',
                defaultMessage: '周期执行',
              }) /*周期执行*/
            }
          </Radio.Button>
          <Radio.Button value={TaskExecStrategy.START_NOW}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ExecuteNow',
                defaultMessage: '立即执行',
              }) /*立即执行*/
            }
          </Radio.Button>
          <Radio.Button value={TaskExecStrategy.START_AT}>
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.ScheduledExecution',
                defaultMessage: '定时执行',
              }) /*定时执行*/
            }
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const triggerStrategy = getFieldValue('triggerStrategy');
          if (triggerStrategy === TaskExecStrategy.START_AT) {
            return (
              <Form.Item
                name="startAt"
                label={formatMessage({
                  id: 'odc.DataArchiveTask.CreateModal.ExecutionTime',
                  defaultMessage: '执行时间',
                })}
                rules={[
                  {
                    required: true,
                    message: '请选择执行时间',
                  },
                ]}
              >
                <DatePicker
                  showTime
                  suffixIcon={<FieldTimeOutlined />}
                  disabledDate={disabledDate}
                  disabledTime={disabledTime}
                />
              </Form.Item>
            );
          }
          if (triggerStrategy === TaskExecStrategy.TIMER) {
            return (
              <>
                <ExecuteFailTip />
                <Form.Item name="crontab">
                  <Crontab ref={ref} initialValue={crontab} onValueChange={handleCrontabChange} />
                </Form.Item>
              </>
            );
          }
          return null;
        }}
      </Form.Item>
    </>
  );
});

export default SchduleExecutionMethodForm;
