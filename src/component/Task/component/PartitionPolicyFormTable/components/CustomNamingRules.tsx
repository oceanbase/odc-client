import { formatMessage } from '@/util/intl';
import { Form, Input, Space } from 'antd';
import { rules } from '../const';
import styles from '../index.less';

const CustomNamingRules = () => {
  return (
    <Space>
      <Form.Item
        name="generateExpr"
        className={styles.noMarginBottom}
        rules={rules.generateExpr}
        style={{ width: 320 }}
      >
        <Input
          placeholder={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.23B74BBB',
              defaultMessage: '请输入表达式',
            }) /*"请输入表达式"*/
          }
          addonBefore={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.D97787FE',
              defaultMessage: '表达式',
            }) /*"表达式"*/
          }
        />
      </Form.Item>
    </Space>
  );
};

export default CustomNamingRules;
