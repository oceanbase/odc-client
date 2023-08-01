import { formatMessage } from '@/util/intl';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Input, Select, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { Expression } from '../../interface';
import { valueIsSelect } from './index';
import styles from './index.less';
export interface ICondition {
  level?: number;
  hasCondition?: boolean;
}
const Condition = ({
  index,
  name,
  fields,
  remove,
  fieldKey,
  formRef,
  isEdit,

  isSelect,
  condition,
  environmentIdMap,
  taskTypeIdMap,
  sqlCheckResultIdMap,
  environmentOptions,
  taskTypeOptions,
  sqlCheckResultOptions,
}) => {
  const expressionValue = condition?.expression || Expression.ENVIRONMENT_ID;
  const [expressionType, setExpressionType] = useState<string>(expressionValue);
  const [value, setValue] = useState<string>(condition?.value || '');
  const firstTimeLoad = useRef<boolean>(true);
  const [IsSelect, setIsSelect] = useState<boolean>(isSelect);
  const [valueOptions, setValueOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >(environmentOptions);
  const [valueMap, setValueMap] = useState<{ [key in string | number]: string }>(environmentIdMap);

  const handleExpressionTypeChange = (value) => {
    setExpressionType(value);
  };
  const initCondition = async () => {
    const newCondition = await formRef.getFieldsValue()?.conditions?.[index];

    if (newCondition) {
      setExpressionType(newCondition?.expression || Expression.ENVIRONMENT_ID);
      setIsSelect(valueIsSelect(newCondition?.expression || Expression.ENVIRONMENT_ID));
    }
    if (expressionType === Expression.ENVIRONMENT_ID) {
      setValueOptions(environmentOptions);
      setValueMap(environmentIdMap);
    }
    if (expressionType === Expression.TASK_TYPE) {
      setValueOptions(taskTypeOptions);
      setValueMap(taskTypeIdMap);
    }
    if (expressionType === Expression.SQL_CHECK_RESULT) {
      setValueOptions(sqlCheckResultOptions);
      setValueMap(sqlCheckResultIdMap);
    }
  };
  const handleExpressionChange = async () => {
    const newFieldValues = await formRef.getFieldsValue();
    await initCondition();
    if (!firstTimeLoad.current) {
      // Expression 变更后 对应Condition种的value值置空
      newFieldValues.conditions[index].value = undefined;
      formRef.setFieldsValue(newFieldValues);
    } else {
      firstTimeLoad.current = false;
    }
  };
  useEffect(() => {
    handleExpressionChange();
  }, [expressionType]);
  return (
    <div key={index} className={styles.condition}>
      <Space key={fieldKey} className={styles.conditionItem}>
        <Form.Item
          name={[name, 'expression']}
          fieldKey={[name, 'expression']}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.ConditionGroup.condition.PleaseSelectAnExpression',
              }), //请选择表达式
            },
          ]}
        >
          <Select
            key={[name, 'expression', index].join('_')}
            style={{ width: '130px' }}
            placeholder={formatMessage({
              id: 'odc.components.ConditionGroup.condition.PleaseSelect',
            })} /*请选择*/
            value={expressionType}
            onSelect={(value, _) => handleExpressionTypeChange(value)}
            options={[
              {
                value: 'EnvironmentId',
                label: formatMessage({
                  id: 'odc.components.ConditionGroup.condition.EnvironmentName',
                }), //环境名称
              },
              {
                value: 'ProjectName',
                label: formatMessage({ id: 'odc.components.ConditionGroup.condition.ProjectName' }), //项目名称
              },
              {
                value: 'DatabaseName',
                label: formatMessage({
                  id: 'odc.components.ConditionGroup.condition.DatabaseName',
                }), //数据库名称
              },
              {
                value: 'TaskType',
                label: formatMessage({ id: 'odc.components.ConditionGroup.condition.TaskType' }), //任务类型
              },
              {
                value: 'SqlCheckResult',
                label: formatMessage({
                  id: 'odc.components.ConditionGroup.condition.SqlCheckResults',
                }), //SQL 检查结果
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name={[name, 'operation']}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.ConditionGroup.condition.SelectAnOperator',
              }), //请选择操作符
            },
          ]}
        >
          <Select
            style={{ width: '80px' }}
            placeholder={formatMessage({
              id: 'odc.components.ConditionGroup.condition.PleaseSelect',
            })} /*请选择*/
            options={[
              {
                value: 'equals',
                label: '==',
              },
              {
                value: 'contains',
                label: formatMessage({ id: 'odc.components.ConditionGroup.condition.Include' }), //包含
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name={[name, 'value']}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.components.ConditionGroup.condition.SelectAValue',
              }), //请选择值
            },
          ]}

          // shouldUpdate={(prevValues, curValues) => prevValues.value !== curValues.value}
        >
          {IsSelect ? (
            <Select
              key={[name, 'value', index].join('_')}
              style={{ width: '318px' }}
              placeholder={formatMessage({
                id: 'odc.components.ConditionGroup.condition.PleaseSelect',
              })} /*请选择*/
              value={isEdit ? valueMap?.[value] || '' : value}
              onSelect={(v, _) => setValue(v)}
              options={valueOptions}
            />
          ) : (
            <Input
              value={value}
              style={{ width: '318px' }}
              placeholder={formatMessage({
                id: 'odc.components.ConditionGroup.condition.PleaseSelect',
              })} /*请选择*/
            />
          )}
        </Form.Item>
        {fields.length > 1 ? (
          <DeleteOutlined className={styles.deleteBtn} onClick={() => remove(index)} />
        ) : null}
      </Space>
    </div>
  );
};

export default Condition;
