import { formatMessage } from '@/util/intl';
/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ICondition } from '@/d.ts/riskDetectRule';
import { DeleteOutlined } from '@ant-design/icons';
import { Form, Input, Select, Space } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EOperator, Expression, ExpressionMap, OperatorMap } from '../interface';
import styles from './index.less';
import { Operator } from './InnerRiskLevel';
const checkIsTags = (condition: ICondition): boolean => {
  return checkMultipleOrTags(condition?.operator) && checkIsProNameOrDBName(condition?.expression);
};
const checkMultipleOrTags = (operator: Operator): boolean => {
  return [EOperator.IN, EOperator.NOT_IN].includes(operator as EOperator);
};
const checkIsProNameOrDBName = (expression: Expression): boolean => {
  return [Expression.PROJECT_NAME, Expression.DATABASE_NAME].includes(expression);
};
const Condition = ({
  formRef,
  indexChan,
  parentField,
  siblingSum,
  prevSiblingSum,
  parentIsRoot = false,
  remove,
  removeGroup,
  setShowConditionGroup,
  environmentMap,
  taskTypeIdMap,
  sqlCheckResultIdMap,
  environmentOptions,
  taskTypeOptions,
  sqlCheckResultOptions,
}) => {
  const [condition, setCondition] = useState<any>(
    parentIsRoot
      ? formRef.getFieldsValue()?.conditions?.[indexChan?.[0]]
      : formRef.getFieldsValue()?.conditions?.[indexChan?.[0]]?.children?.[indexChan?.[1]],
  );
  const firstTimeLoadRef = useRef<boolean>(true);
  const [expression, setExpression] = useState<Expression>(condition?.expression);
  const [operator, setOperator] = useState<Operator>(condition?.operator);
  const [valueOptions, setValueOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >(environmentOptions);
  const [valueMap, setValueMap] = useState<{ [key in string | number]: string }>(environmentMap);
  const [isMultiple, setIsMultiple] = useState<boolean>(
    checkMultipleOrTags(condition?.operator) || false,
  );
  const [isTags, setIsTags] = useState<boolean>(checkIsTags(condition));
  const [isInputComponent, setIsInputComponent] = useState<boolean>(false);
  const [value, setValue] = useState<string | string[]>(condition?.value);
  const initCondition = () => {
    handleOperatorChange(operator);
    switch (expression) {
      case Expression.ENVIRONMENT_ID:
      case Expression.ENVIRONMENT_NAME: {
        setValueOptions(environmentOptions);
        setValueMap(environmentMap);
        return;
      }
      case Expression.TASK_TYPE: {
        setValueOptions(taskTypeOptions);
        setValueMap(taskTypeIdMap);
        return;
      }
      case Expression.SQL_CHECK_RESULT: {
        setValueOptions(sqlCheckResultOptions);
        setValueMap(sqlCheckResultIdMap);
        return;
      }
      case Expression.PROJECT_NAME: {
        setIsTags(true);
        setValueOptions([]);
        return;
      }
      case Expression.DATABASE_NAME: {
        setIsTags(true);
        setValueOptions([]);
        return;
      }
      default: {
        setValueOptions(environmentOptions);
        setValueMap(environmentMap);
        return;
      }
    }
  };
  const handleOperatorChange = (operatorValue) => {
    if (checkMultipleOrTags(operatorValue)) {
      setIsMultiple(true);
      if (checkIsProNameOrDBName(expression)) {
        setIsInputComponent(false);
        setIsTags(true);
      } else {
        const data = formRef.getFieldsValue()?.conditions;
        if (parentIsRoot && !firstTimeLoadRef.current) {
          if (!firstTimeLoadRef.current) {
            data[indexChan[0]].value = undefined;
          }
        } else {
          if (!firstTimeLoadRef.current) {
            data[indexChan[0]].children[indexChan[1]].value = undefined;
          }
        }
        formRef.setFieldsValue({
          conditions: data,
        });
      }
    } else {
      setIsMultiple(false);
      if (checkIsProNameOrDBName(expression)) {
        setIsInputComponent(true);
        setValue(value);
      } else {
        setIsInputComponent(false);
        const data = formRef.getFieldsValue()?.conditions;
        if (parentIsRoot && !firstTimeLoadRef.current) {
          if (!firstTimeLoadRef.current) {
            data[indexChan[0]].value = undefined;
          }
        } else {
          if (!firstTimeLoadRef.current) {
            data[indexChan[0]].children[indexChan[1]].value = undefined;
          }
        }
        formRef.setFieldsValue({
          conditions: data,
        });
      }
    }
    firstTimeLoadRef.current = false;
    setOperator(operatorValue);
  };
  useLayoutEffect(() => {
    let condition;
    if (parentIsRoot) {
      condition = formRef.getFieldsValue()?.conditions?.[indexChan[0]];
    } else {
      condition = formRef.getFieldsValue()?.conditions?.[indexChan[0]]?.children[indexChan[1]];
    }
    setCondition(condition);
    setIsMultiple(checkMultipleOrTags(condition?.operator));
    setIsTags(checkIsTags(condition));
    if (
      checkIsProNameOrDBName(condition?.expression) &&
      !checkMultipleOrTags(condition?.operator)
    ) {
      setIsInputComponent(true);
    } else {
      setIsInputComponent(false);
    }
    setValue(condition?.value);
  }, []);
  useEffect(() => {
    initCondition();
  }, [expression]);
  return (
    <Space key={indexChan?.at(-1)} className={styles.gl} align="baseline">
      <Form.Item
        name={[parentField?.name, 'expression']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.TheExpressionCannotBeEmpty',
              defaultMessage: '表达式不能为空',
            }), //'表达式不能为空'
          },
        ]}
      >
        <Select
          style={{
            width: '200px',
          }}
          placeholder={
            formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.PleaseChoose',
              defaultMessage: '请选择',
            }) //'请选择'
          }
          options={[
            {
              label: ExpressionMap[Expression.ENVIRONMENT_NAME],
              value: Expression.ENVIRONMENT_NAME,
            },
            {
              label: ExpressionMap[Expression.PROJECT_NAME],
              value: Expression.PROJECT_NAME,
            },
            {
              label: ExpressionMap[Expression.DATABASE_NAME],
              value: Expression.DATABASE_NAME,
            },
            {
              label: ExpressionMap[Expression.TASK_TYPE],
              value: Expression.TASK_TYPE,
            },
            {
              label: ExpressionMap[Expression.SQL_CHECK_RESULT],
              value: Expression.SQL_CHECK_RESULT,
            },
          ]}
          onSelect={(_, { value }) => {
            const data = formRef.getFieldsValue();
            if (parentIsRoot) {
              data.conditions[indexChan[0]].expression = value;
              data.conditions[indexChan[0]].value = undefined;
              formRef.setFieldsValue({
                ...data,
              });
            } else {
              data.conditions[indexChan[0]].children[indexChan[1]].expression = value;
              data.conditions[indexChan[0]].children[indexChan[1]].value = undefined;
              formRef.setFieldsValue({
                ...data,
              });
            }
            if (checkIsProNameOrDBName(value)) {
              if (checkMultipleOrTags(operator)) {
                setIsInputComponent(false);
                setIsTags(true);
              } else {
                setIsInputComponent(true);
                setIsTags(false);
              }
            } else {
              setIsTags(false);
            }
            setExpression(value);
          }}
        />
      </Form.Item>
      <Form.Item
        name={[parentField?.name, 'operator']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.TheOperatingSymbolCannotBe',
              defaultMessage: '操作符不能为空',
            }), //'操作符不能为空'
          },
        ]}
      >
        <Select
          style={{
            width: '200px',
          }}
          placeholder={
            formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.PleaseChoose.1',
              defaultMessage: '请选择',
            }) //'请选择'
          }
          options={[
            {
              label: OperatorMap[EOperator.EQUALS],
              value: EOperator.EQUALS,
            },
            {
              label: OperatorMap[EOperator.NOT_EQUALS],
              value: EOperator.NOT_EQUALS,
            },
            {
              label: OperatorMap[EOperator.CONTAINS],
              value: EOperator.CONTAINS,
            },
            {
              label: OperatorMap[EOperator.NOT_CONTAINS],
              value: EOperator.NOT_CONTAINS,
            },
            {
              label: OperatorMap[EOperator.IN],
              value: EOperator.IN,
            },
            {
              label: OperatorMap[EOperator.NOT_IN],
              value: EOperator.NOT_IN,
            },
          ]}
          onSelect={(value) => {
            handleOperatorChange(value);
          }}
        />
      </Form.Item>
      <Form.Item
        name={[parentField?.name, 'value']}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.TheValueCannotBeEmpty',
              defaultMessage: '值不能为空',
            }), //'值不能为空'
          },
          {
            pattern: /^[^\s]*$/,
            message: formatMessage({
              id: 'odc.src.page.Secure.RiskLevel.components.ForbiddenInputSpace',
              defaultMessage: '禁止输入空格',
            }), //'禁止输入空格'
          },
        ]}
      >
        {isInputComponent ? (
          <Input
            style={{
              width: '240px',
            }}
            value={value}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Secure.RiskLevel.components.PleaseEnter',
                defaultMessage: '请输入',
              }) //'请输入'
            }
          />
        ) : (
          <Select
            {...(isMultiple
              ? isTags
                ? {
                    mode: 'tags',
                    maxTagCount: 2,
                  }
                : {
                    mode: 'multiple',
                    maxTagCount: 1,
                  }
              : {})}
            style={{
              width: '240px',
            }}
            value={value}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Secure.RiskLevel.components.PleaseChoose.2',
                defaultMessage: '请选择',
              }) //'请选择'
            }
            options={valueOptions}
          />
        )}
      </Form.Item>
      <DeleteOutlined
        onClick={async () => {
          if (parentIsRoot) {
            remove(indexChan?.[0]);
            if (prevSiblingSum === 1) {
              setShowConditionGroup(false);
            }
          } else {
            remove(indexChan?.[1]);
            if (siblingSum === 1) {
              removeGroup(indexChan?.[0]);
              if (prevSiblingSum === 1) {
                setShowConditionGroup(false);
              }
            }
          }
        }}
      />
    </Space>
  );
};
export default Condition;
