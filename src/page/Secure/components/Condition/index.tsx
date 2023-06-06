import { Condition } from '@/d.ts/riskDetectRule';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space } from 'antd';

import styles from './index.less';
export interface ICondition {
  level?: number;
  hasCondition?: boolean;
}
export interface IConditionGroup {
  initialValue: Condition[];
}
const ConditionGroup: React.FC<IConditionGroup> = ({ initialValue }) => {
  console.log(initialValue);
  const handleValid = async (_, values) => {
    return !values?.length ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <div>
      <div className={styles.labelContainer}>
        <div className="label">条件</div>
        <div
          className="extra"
          style={{
            color: 'rgba(0,0,0,0.45)',
          }}
        >
          条件是通过表达式配置的规则。例如：条件「环境 为 prod」将会匹配在「prod」环境中执行的工单。
        </div>
      </div>
      <Form.List
        name="conditions"
        initialValue={initialValue}
        rules={[
          {
            validator: handleValid,
          },
        ]}
      >
        {(fields, { add, remove, move }, { errors }) => (
          <>
            {fields.map(({ key, name, fieldKey }: any, index) => (
              <div key={key} className={styles.condition}>
                <Space className={styles.conditionItem}>
                  <Form.Item name={[name, 'expression']} fieldKey={[fieldKey, 'expression']}>
                    <Select
                      style={{ width: '130px' }}
                      placeholder="环境 ID"
                      options={[
                        {
                          value: 'expression',
                          label: '环境 ID',
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name={[name, 'operation']} fieldKey={[fieldKey, 'operation']}>
                    <Select
                      style={{ width: '80px' }}
                      placeholder="equal"
                      options={[
                        {
                          value: 'equal',
                          label: '==',
                        },
                        {
                          value: 'unequal',
                          label: '!=',
                        },
                        {
                          value: 'lessThan',
                          label: '<',
                        },
                        {
                          value: 'lessThanOrEqual',
                          label: '<=',
                        },
                        {
                          value: 'greaterThan',
                          label: '>',
                        },
                        {
                          value: 'greaterThanOrEqual',
                          label: '>=',
                        },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name={[name, 'value']} fieldKey={[fieldKey, 'value']}>
                    <Select
                      style={{ width: '318px' }}
                      placeholder="Dev"
                      options={[
                        {
                          value: 'dev',
                          label: 'Dev',
                        },
                        {
                          value: 'test',
                          label: 'Test',
                        },
                        {
                          value: 'prod',
                          label: 'Prod',
                        },
                      ]}
                    />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <DeleteOutlined className={styles.deleteBtn} onClick={() => remove(index)} />
                  ) : null}
                </Space>
              </div>
            ))}
            <Button
              onClick={add}
              type="dashed"
              style={{
                width: '544px',
              }}
              block
              icon={<PlusOutlined />}
            >
              条件
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};
export default ConditionGroup;
