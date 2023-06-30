import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance } from 'antd';
import { SelectItemProps } from '../../index';
import Condition from './condition';
import styles from './index.less';

export interface ICondition {
  level?: number;
  hasCondition?: boolean;
}
export interface IConditionGroup {
  formRef: FormInstance<any>;
  isEdit: boolean;
  selectedRecord: IRiskDetectRule;
  environmentIdMap: {
    [key in string | number]: string;
  };
  environmentOptions: SelectItemProps[];
  taskTypeOptions: SelectItemProps[];
  sqlCheckResultOptions: SelectItemProps[];
}
const ConditionGroup: React.FC<IConditionGroup> = ({
  isEdit,
  selectedRecord,
  formRef,
  environmentIdMap,
  environmentOptions,
  taskTypeOptions,
  sqlCheckResultOptions,
}) => {
  return (
    <div>
      <div className={styles.labelContainer}>
        <div className={styles.label}>条件</div>
        <div className={styles.extra}>
          条件是通过表达式配置的规则。例如：条件「环境 为 prod」将会匹配在「prod」环境中执行的工单。
        </div>
      </div>
      <Form.List name="conditions" initialValue={selectedRecord?.conditions || []}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(({ key, name, fieldKey }: any, index) => {
              return (
                <Condition
                  key={key}
                  {...{
                    index,
                    name,
                    fields,
                    remove,
                    fieldKey,
                    formRef,
                    isEdit,

                    environmentIdMap,
                    environmentOptions,
                    taskTypeOptions,
                    sqlCheckResultOptions,
                  }}
                />
              );
            })}
            <Button
              onClick={() => add()}
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
