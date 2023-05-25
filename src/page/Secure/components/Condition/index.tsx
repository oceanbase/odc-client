import { DeleteOutlined } from '@ant-design/icons';
import { Select, Space } from 'antd';
import styles from './index.less';

const Condition: React.FC<{ level: number }> = ({ level }) => {
  return (
    <>
      <Space>
        <Select
          style={{ width: '118px' }}
          defaultValue={'envID'}
          options={[
            {
              value: 'envID',
              label: '环境 ID',
            },
          ]}
        />
        <Select
          style={{ width: '80px' }}
          defaultValue={'equal'}
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
        <Select
          style={{ width: '200px' }}
          defaultValue={'dev'}
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
        <DeleteOutlined className={styles.deleteBtn} />
      </Space>
    </>
  );
};
const ConditionGroup = () => {
  return <div>{}</div>;
};
export default Condition;
