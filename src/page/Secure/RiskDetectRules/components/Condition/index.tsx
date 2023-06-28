import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, FormInstance, Input, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import { SelectItemProps } from '../../FormRiskDetectDrawer';

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
    [key in string]: number;
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
  // const reInitCondition = () => {
  //   formRef.setFieldsValue(selectedRecord);
  // };
  return (
    <div>
      <div className={styles.labelContainer}>
        <div className={styles.label}>条件</div>
        <div className={styles.extra}>
          条件是通过表达式配置的规则。例如：条件「环境 为 prod」将会匹配在「prod」环境中执行的工单。
        </div>
      </div>
      <Form.List name="conditions" initialValue={selectedRecord?.conditions || []}>
        {(fields, { add, remove, move }, { errors }) => (
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

const Condition = ({
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
}) => {
  const expressionValue = formRef.getFieldsValue()?.conditions?.[index]?.expression;
  const [expressionType, setExpressionType] = useState<string>(
    expressionValue,
  );
  const [value, setValue] = useState<string>();

  const [IsSelect, setIsSelect] = useState<boolean>(
    expressionValue
      ? ['EnvironmentId', 'TaskType', 'SqlCheckResult'].includes(expressionValue)
      : ['EnvironmentId', 'TaskType', 'SqlCheckResult'].includes(expressionType)
  );
  const [valueOptions, setValueOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const handleExpressionTypeChange = (value) => {
    setExpressionType(value);
  };
  const initCondition = async () => {
    const expressionType = expressionValue || 'EnvironmentId';

    if (expressionType === 'EnvironmentId') {
      setValueOptions(environmentOptions);
    }
    if (expressionType === 'TaskType') {
      setValueOptions(taskTypeOptions);
    }
    if (expressionType === 'SqlCheckResult') {
      setValueOptions(sqlCheckResultOptions);
    }
  };
  useEffect(() => {
    initCondition();
  }, [environmentOptions, taskTypeOptions, sqlCheckResultOptions]);
  useEffect(() => {
    // Expression 变更后 对应Condition种的value值置空
    const newFieldValues = formRef.getFieldsValue();
    newFieldValues.conditions[index].value = undefined;
    formRef.setFieldsValue(newFieldValues);
  }, [expressionType]);
  useEffect(() => {
    setIsSelect(expressionValue
      ? ['EnvironmentId', 'TaskType', 'SqlCheckResult'].includes(expressionValue)
      : expressionType ? ['EnvironmentId', 'TaskType', 'SqlCheckResult'].includes(expressionType) : true)
  }, [expressionValue, expressionType])
  return (
    <div key={index} className={styles.condition}>
      <Space key={fieldKey} className={styles.conditionItem}>
        <Form.Item
          key={[name, 'expression'].join('_')}
          name={[name, 'expression']}
          fieldKey={[name, 'expression']}
          required
          rules={[
            {
              required: true,
              message: '请选择Expression',
            },
          ]}
        >
          <Select
            key={[name, 'expression', index].join('_')}
            style={{ width: '130px' }}
            placeholder="请选择"
            value={expressionType}
            onSelect={(value, _) => handleExpressionTypeChange(value)}
            options={[
              {
                value: 'EnvironmentId',
                label: '环境名称',
              },
              {
                value: 'ProjectName',
                label: '项目名称',
              },
              {
                value: 'DatabaseName',
                label: '数据库名称',
              },
              {
                value: 'TaskType',
                label: '任务类型',
              },
              {
                value: 'SqlCheckResult',
                label: 'SQL 检查结果',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          key={[name, 'operation'].join('_')}
          name={[name, 'operation']}
          fieldKey={[name, 'operation']}
          required
          rules={[
            {
              required: true,
              message: '请选择Expression',
            },
          ]}
        >
          <Select
            key={[name, 'operation', index].join('_')}
            style={{ width: '80px' }}
            placeholder="请选择"
            options={[
              {
                value: 'equals',
                label: '==',
              },
              {
                value: 'contains',
                label: '包含',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          key={[name, 'value'].join('_')}
          name={[name, 'value']}
          fieldKey={[name, 'value']}
          required
          rules={[
            {
              required: true,
              message: '请选择Expression',
            },
          ]}
          shouldUpdate={(prevValues, curValues) => prevValues.value !== curValues.value}
        >
          {
            IsSelect ? (
              <Select
                key={[name, 'value', index].join('_')}
                style={{ width: '318px' }}
                placeholder="请选择"
                value={isEdit ? environmentIdMap?.[value] || '' : value}
                onSelect={(v, _) => setValue(v)}
                options={valueOptions}
              />
            ) : (
              <Input value={value} style={{ width: '318px' }} placeholder="请选择" />
            )
          }
        </Form.Item>
        {fields.length > 1 ? (
          <DeleteOutlined className={styles.deleteBtn} onClick={() => remove(index)} />
        ) : null}
      </Space>
    </div>
  );
};
