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

import HelpDoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { AutoComplete, Button, Form, Input, InputNumber, Select, Space } from 'antd';
import classNames from 'classnames';
import { timeUnitOptions } from '@/component/Task/modals/DataArchiveTask/CreateModal/VariableConfig';
import { variable } from './index';
import styles from './index.less';
import { rules } from './const';
const ENABLE_PATTERN_OPERATOR = false;
const timeFormatOptions = ['yyyy-MM-dd', 'yyyyMMdd', 'yyyy-MM-01'].map((item) => ({
  label: item,
  value: item,
}));
const operatorOptions = ['+', '-'].map((item) => ({
  label: item,
  value: item,
}));
interface IProps {
  form: FormInstance;
}
interface IProps {}
const VariableConfig: React.FC<IProps> = (props) => {
  const variables = Form.useWatch('variables', props.form);
  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Space>
        {
          formatMessage({
            id: 'odc.src.component.Task.DataClearTask.CreateModal.CustomVariable',
            defaultMessage: '\n        自定义变量\n        ',
          }) /* 
        自定义变量
        */
        }

        <span className={styles.desc}>
          <HelpDoc leftText isTip doc="dataClearVariablesDoc">
            {
              formatMessage({
                id: 'odc.src.component.Task.DataClearTask.CreateModal.VariablesCanBeReferencedIn',
                defaultMessage:
                  '\n              变量可在清理范围的清理条件中引用 (可选)\n            ',
              }) /* 
            变量可在清理范围的清理条件中引用 (可选)
            */
            }
          </HelpDoc>
        </span>
      </Space>
      {!!variables?.length && (
        <Space className={styles.infoLabel}>
          <div
            style={{
              width: '194px',
            }}
          >
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.VariableConfig.VariableName',
                defaultMessage: '变量名',
              }) /*变量名*/
            }
          </div>
          <div
            style={{
              width: '170px',
            }}
          >
            {
              formatMessage({
                id: 'odc.DataClearTask.CreateModal.VariableConfig.TimeFormat',
                defaultMessage: '时间格式',
              }) /*时间格式*/
            }
          </div>
          <div
            style={{
              width: '250px',
            }}
          >
            <HelpDoc leftText isTip doc="dataArchiveTimeDoc">
              {
                formatMessage({
                  id: 'odc.src.component.Task.DataClearTask.CreateModal.Shift',
                  defaultMessage: '\n              时间偏移\n            ',
                }) /* 
            时间偏移
            */
              }
            </HelpDoc>
          </div>
        </Space>
      )}

      <Form.List name="variables">
        {(fields, { add, remove }) => (
          <div className={styles.infoBlock}>
            {fields.map(({ key, name, ...restField }, index) => (
              <div
                key={key}
                className={classNames(styles.variables, {
                  [styles.delete]: true,
                })}
              >
                <Form.Item
                  {...restField}
                  style={{
                    width: '194px',
                  }}
                  name={[name, 'name']}
                >
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.DataClearTask.CreateModal.VariableConfig.PleaseEnter',
                      defaultMessage: '请输入',
                    })} /*请输入*/
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  style={{
                    width: '170px',
                  }}
                  name={[name, 'format']}
                >
                  <AutoComplete
                    placeholder={formatMessage({
                      id: 'odc.DataClearTask.CreateModal.VariableConfig.PleaseSelect',
                      defaultMessage: '请选择',
                    })}
                    /*请选择*/ options={timeFormatOptions}
                  />
                </Form.Item>
                <Form.List name={[name, 'pattern']}>
                  {(subFields, { add: _add, remove: _remove }) => {
                    const disabledAdd = subFields.length >= 3;
                    const required = !!Object.values(variables?.[index]?.pattern?.[0] ?? {})?.join(
                      '',
                    )?.length;
                    return (
                      <div className={styles.infoBlock}>
                        {subFields.map(({ key, name, ...restField }) => (
                          <div className={styles.pattern}>
                            <Form.Item
                              {...restField}
                              name={[name, 'operator']}
                              rules={rules.operator({ required })}
                            >
                              <Select
                                placeholder={formatMessage({
                                  id: 'odc.DataClearTask.CreateModal.VariableConfig.PleaseSelect',
                                  defaultMessage: '请选择',
                                })}
                                /*请选择*/ options={operatorOptions}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'step']}
                              rules={rules.step({ required })}
                            >
                              <InputNumber
                                placeholder={formatMessage({
                                  id: 'odc.DataClearTask.CreateModal.VariableConfig.PleaseEnter',
                                  defaultMessage: '请输入',
                                })}
                                /*请输入*/ min={1}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'unit']}
                              rules={rules.unit({ required })}
                            >
                              <Select
                                placeholder={formatMessage({
                                  id: 'odc.DataClearTask.CreateModal.VariableConfig.PleaseSelect',
                                  defaultMessage: '请选择',
                                })}
                                /*请选择*/ options={timeUnitOptions}
                              />
                            </Form.Item>
                            {ENABLE_PATTERN_OPERATOR && (
                              <>
                                <Button type="text" disabled={disabledAdd}>
                                  <PlusOutlined onClick={() => _add()} />
                                </Button>
                                <Button type="text">
                                  <MinusOutlined
                                    onClick={() => {
                                      if (subFields?.length > 1) _remove(name);
                                    }}
                                  />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </Form.List>
                <DeleteOutlined onClick={() => remove(name)} />
              </div>
            ))}
            <Form.Item
              style={{
                width: '100%',
              }}
            >
              <Button type="dashed" onClick={() => add(variable)} block icon={<PlusOutlined />}>
                {
                  formatMessage({
                    id: 'odc.DataClearTask.CreateModal.VariableConfig.AddVariables',
                    defaultMessage: '添加变量',
                  }) /*添加变量*/
                }
              </Button>
            </Form.Item>
          </div>
        )}
      </Form.List>
    </Space>
  );
};
export default VariableConfig;
