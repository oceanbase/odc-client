import { Form, InputNumber, Space, Checkbox } from 'antd';
import React, { useState } from 'react';
interface IProps {}
const TaskDurationItem: React.FC<IProps> = (props) => {
  const [hasTaskDuration, setTaskDuration] = useState<boolean>(false);
  return (
    <>
      <Form.Item
        extra={'任务启动指定时长后，若未完成则会暂停调度，等待下一次调度'}
        style={{ marginBottom: 8 }}
      >
        <Checkbox value={hasTaskDuration} onChange={(e) => setTaskDuration(e.target.checked)}>
          指定任务时长
        </Checkbox>
      </Form.Item>
      {hasTaskDuration && (
        <Space size={4} align="center" style={{ marginBottom: 12 }}>
          <Form.Item
            style={{
              marginBottom: 0,
            }}
            name="taskExecutionDurationHours"
            rules={[
              {
                validator: (_, value) =>
                  value > 0 ? Promise.resolve() : Promise.reject(new Error('请输入(不小于0)')),
              },
            ]}
            initialValue={1}
          >
            <InputNumber min={0} controls={true} />
          </Form.Item>
          <span>小时</span>
        </Space>
      )}
    </>
  );
};
export default TaskDurationItem;
