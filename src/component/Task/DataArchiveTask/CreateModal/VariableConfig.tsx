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
import { Button, Form, Input, InputNumber, Select, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import { variable } from './index';
import styles from './index.less';
export const timeUnitOptions = [
  {
    label: formatMessage({
      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.Second',
    }),
    //'秒'
    value: 's',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Points',
    }),
    //分
    value: 'm',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Hours',
    }),
    //小时
    value: 'h',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Day',
    }),
    //日
    value: 'd',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Zhou',
    }),
    //周
    value: 'w',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Month',
    }),
    //月
    value: 'M',
  },
  {
    label: formatMessage({
      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.Year',
    }),
    //年
    value: 'y',
  },
];
const ENABLE_PATTERN_OPERATOR = false;
const timeFormatOptions = ['yyyy-MM-dd', 'yyyyMMdd'].map((item) => ({
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
            id: 'odc.src.component.Task.DataArchiveTask.CreateModal.CustomVariable',
          }) /* 
         自定义变量
         */
        }
        <span className={styles.desc}>
          <HelpDoc leftText isTip doc="dataArchiveVariablesDoc">
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.VariableConfig.VariablesCanBeReferencedIn.1',
              }) /*变量可在归档配置的过滤条件中引用 (可选)*/
            }
          </HelpDoc>
        </span>
      </Space>
      {!!variables?.length && (
        <Space
          style={{
            width: '100%',
          }}
        >
          <div
            style={{
              width: '194px',
            }}
          >
            {
              formatMessage({
                id: 'odc.DataArchiveTask.CreateModal.VariableConfig.VariableName',
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
                id: 'odc.DataArchiveTask.CreateModal.VariableConfig.TimeFormat',
              }) /*时间格式*/
            }
          </div>
          <div
            style={{
              width: '305px',
            }}
          >
            <HelpDoc leftText isTip doc="dataArchiveTimeDoc">
              {
                formatMessage({
                  id: 'odc.src.component.Task.DataArchiveTask.CreateModal.Shift',
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
                <Form.Item {...restField} name={[name, 'name']}>
                  <Input
                    placeholder={formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseEnter',
                    })} /*请输入*/
                  />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'format']}>
                  <Select
                    placeholder={formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                    })}
                    /*请选择*/ options={timeFormatOptions}
                  />
                </Form.Item>
                <Form.List name={[name, 'pattern']}>
                  {(subFields, { add: _add, remove: _remove }) => {
                    const disabledAdd = subFields.length >= 3;
                    const required = !!Object.values(variables?.[index].pattern?.[0] ?? {})?.join(
                      '',
                    )?.length;
                    return (
                      <div className={styles.infoBlock}>
                        {subFields.map(({ key, name, ...restField }) => (
                          <div className={styles.pattern}>
                            <Form.Item
                              {...restField}
                              name={[name, 'operator']}
                              rules={[
                                {
                                  required,
                                  message: formatMessage({
                                    id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseChoose',
                                  }), //'请选择'
                                },
                              ]}
                            >
                              <Select
                                placeholder={formatMessage({
                                  id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                                })}
                                /*请选择*/ options={operatorOptions}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'step']}
                              rules={[
                                {
                                  required,
                                  message: formatMessage({
                                    id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseEnter',
                                  }), //'请输入'
                                },
                              ]}
                            >
                              <InputNumber
                                placeholder={formatMessage({
                                  id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseEnter',
                                })}
                                /*请输入*/ min={1}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'unit']}
                              rules={[
                                {
                                  required,
                                  message: formatMessage({
                                    id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseChoose.1',
                                  }), //'请选择'
                                },
                              ]}
                            >
                              <Select
                                placeholder={formatMessage({
                                  id: 'odc.DataArchiveTask.CreateModal.VariableConfig.PleaseSelect',
                                })}
                                /*请选择*/ options={timeUnitOptions}
                              />
                            </Form.Item>
                            {ENABLE_PATTERN_OPERATOR && (
                              <>
                                <Tooltip
                                  title={
                                    formatMessage({
                                      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.AddTimeOffset',
                                    }) /* 添加时间偏移 */
                                  }
                                >
                                  <Button type="text" disabled={disabledAdd}>
                                    <PlusOutlined onClick={() => _add()} />
                                  </Button>
                                </Tooltip>
                                <Tooltip
                                  title={
                                    formatMessage({
                                      id: 'odc.src.component.Task.DataArchiveTask.CreateModal.DeleteTimeOffset',
                                    }) /* 删除时间偏移 */
                                  }
                                >
                                  <Button type="text">
                                    <MinusOutlined
                                      onClick={() => {
                                        if (subFields?.length > 1) _remove(name);
                                      }}
                                    />
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </Form.List>
                <Tooltip
                  title={formatMessage({
                    id: 'odc.DataArchiveTask.CreateModal.VariableConfig.DeleteAVariable',
                  })} /*删除变量*/
                >
                  <DeleteOutlined onClick={() => remove(name)} />
                </Tooltip>
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
                    id: 'odc.DataArchiveTask.CreateModal.VariableConfig.AddVariables',
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
