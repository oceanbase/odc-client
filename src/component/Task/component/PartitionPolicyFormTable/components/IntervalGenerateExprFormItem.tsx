import { formatMessage } from '@/util/intl';
import { Form, Input } from 'antd';

const IntervalGenerateExprFormItem = () => {
  return (
    <Form.Item
      name="intervalGenerateExpr"
      label={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyFormTable.7BC3752C',
          defaultMessage: '命名间隔',
        }) /*"命名间隔"*/
      }
      tooltip={formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.7F47487A',
        defaultMessage:
          "可在命名规则表达式中通过 ${INTERVAL} 变量引用，比如:concat('P_',${COL1}+${INTERVAL})",
      })}
    >
      <Input
        style={{ width: 180 }}
        placeholder={
          formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.07788524',
            defaultMessage: '请输入',
          }) /*"请输入"*/
        }
      />
    </Form.Item>
  );
};

export default IntervalGenerateExprFormItem;
