import { TaskExecStrategy } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { FieldTimeOutlined } from '@ant-design/icons';
import { DatePicker, Form, Radio } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import React from 'react';

interface IProps {
  isReadonlyPublicConn: boolean;
}

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  return current && current < moment();
};

const TimerSelect: React.FC<IProps> = (props) => {
  const { isReadonlyPublicConn } = props;
  const label = isReadonlyPublicConn
    ? formatMessage({
        id: 'odc.components.TaskTimer.ExecutionMethodAfterTheApproval',
      }) //执行方式: 审批完成后
    : formatMessage({ id: 'odc.components.TaskTimer.ExecutionMethod' }); //执行方式
  return (
    <>
      <Form.Item label={label} name="executionStrategy" required>
        <Radio.Group>
          <Radio value={TaskExecStrategy.AUTO}>
            {
              formatMessage({
                id: 'odc.components.TaskTimer.ExecuteNow',
              }) /*立即执行*/
            }
          </Radio>
          {!isClient() ? (
            <Radio value={TaskExecStrategy.TIMER}>
              {
                formatMessage({
                  id: 'odc.components.TaskTimer.ScheduledExecution',
                }) /*定时执行*/
              }
            </Radio>
          ) : null}
          {isReadonlyPublicConn && (
            <Radio value={TaskExecStrategy.MANUAL}>
              {
                formatMessage({
                  id: 'odc.components.TaskTimer.ManualExecution',
                }) /*手动执行*/
              }
            </Radio>
          )}
        </Radio.Group>
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const strategy = getFieldValue('executionStrategy');
          return (
            strategy === TaskExecStrategy.TIMER && (
              <Form.Item
                name="executionTime"
                label={formatMessage({
                  id: 'odc.components.TaskTimer.ExecutionTime',
                })} /*执行时间*/
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.components.TaskTimer.SelectAnExecutionTime',
                    }), //请选择执行时间
                  },
                ]}
                extra={
                  isReadonlyPublicConn
                    ? formatMessage({
                        id: 'odc.components.TaskTimer.IfTheApprovalIsNot',
                      }) //若执行时间前未完成审批，则任务将终止不执行
                    : null
                }
              >
                <DatePicker
                  disabledDate={disabledDate}
                  showTime
                  suffixIcon={<FieldTimeOutlined />}
                />
              </Form.Item>
            )
          );
        }}
      </Form.Item>
    </>
  );
};

export default TimerSelect;
