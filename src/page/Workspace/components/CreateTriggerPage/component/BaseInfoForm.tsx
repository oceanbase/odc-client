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

import { ITable, ITriggerBaseInfoForm, TriggerSchemaType, TriggerState } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Col, Form, Input, Radio, Row, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';
import styles from '../index.less';
import { Step, StepStatus } from '../type';

const { Option } = Select;
interface IProps {
  onSave: (step: Step, info: any) => void;
  setStepStatus: (step: Step, status: StepStatus) => void;
  reloadSchemaMode: (e: string) => void;
  reloadColumns: (e: string) => void;
  databases: any;
  tables: ITable[];
  initialValues: ITriggerBaseInfoForm;
  enableTriggerAlterStatus: boolean;
}

class BaseInfoForm extends Component<IProps> {
  private formRef = React.createRef<FormInstance>();

  handleSubmit = () => {
    this.formRef.current
      .validateFields()
      .then((values) => {
        this.props.onSave(Step.BASEINFO, values);
      })
      .catch((errorInfo) => {
        this?.formRef?.current?.scrollToField(errorInfo?.errorFields?.[0]?.name);
        throw new Error(errorInfo);
      });
  };

  handleChange = () => {
    this.props.setStepStatus(Step.BASEINFO, StepStatus.EDITING);
  };

  handleSchemaModeChange = (value: string) => {
    this.props.reloadSchemaMode(value);
    this.formRef.current.setFieldsValue({
      schemaName: '',
    });
  };

  handleSchemaNameChange = (value: string) => {
    this.props.reloadColumns(value);
  };

  render() {
    const { databases, tables, initialValues = {}, enableTriggerAlterStatus } = this.props;
    return (
      <Form
        ref={this.formRef}
        requiredMark={false}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={this.handleChange}
      >
        <Row gutter={24}>
          <Col span="8">
            <Form.Item
              name="triggerName"
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.BaseInfoForm.TriggerName',
                defaultMessage: '请输入触发器名称',
              })}
              /* 触发器名称 */
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.CreateTriggerPage.component.BaseInfoForm.EnterTheTriggerName',
                    defaultMessage: '请填写触发器名称',
                  }),
                  // 请填写触发器名称
                },
                {
                  max: 128,
                  message: formatMessage({
                    id: 'odc.CreateTriggerPage.component.BaseInfoForm.TheLengthCannotExceedCharacters',
                    defaultMessage: '长度不超过 128 个字符',
                  }),

                  // 长度不超过 128 个字符
                },
              ]}
            >
              <Input
                placeholder={formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.TriggerName',
                  defaultMessage: '请输入触发器名称',
                })}

                /* 触发器名称 */
              />
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.space}>
          <Form.Item
            style={{
              width: '216px',
            }}
            name="schemaMode"
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.BaseInfoForm.ReferenceObjectMode',
              defaultMessage: '基准对象模式',
            })}
            /* 基准对象模式 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.SelectTheBaseObjectMode',
                  defaultMessage: '请选择基准对象模式',
                }),
                // 请选择基准对象模式
              },
            ]}
          >
            <Select onChange={this.handleSchemaModeChange}>
              {databases.map((d) => {
                return (
                  <Option key={d.name} value={d.name}>
                    {d.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            style={{
              width: '216px',
            }}
            name="schemaType"
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.BaseInfoForm.BaseObjectType',
              defaultMessage: '基准对象类型',
            })}
            /* 基准对象类型 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.SelectABaseObjectType',
                  defaultMessage: '请选择基准对象类型',
                }),
                // 请选择基准对象类型
              },
            ]}
          >
            <Select>
              <Option value={TriggerSchemaType.TABLE}>{TriggerSchemaType.TABLE}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={{
              width: '216px',
            }}
            name="schemaName"
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.BaseInfoForm.BaseObjectName',
              defaultMessage: '基准对象名称',
            })}
            /* 基准对象名称 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.SelectABaseObjectName',
                  defaultMessage: '请选择基准对象名称',
                }),
                // 请选择基准对象名称
              },
            ]}
          >
            <Select
              placeholder={
                formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.SelectABaseObject',
                  defaultMessage: '请选择基准对象',
                }) // 请选择基准对象
              }
              showSearch
              onChange={this.handleSchemaNameChange}
            >
              {tables.map((t) => {
                return (
                  <Option key={t.tableName} value={t.tableName}>
                    {t.tableName}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </div>
        <Row>
          <Col span="8">
            <Form.Item
              className={styles.status}
              name="enableState"
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.BaseInfoForm.TriggerStatus',
                defaultMessage: '触发器状态',
              })}
              /* 触发器状态 */
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.CreateTriggerPage.component.BaseInfoForm.SelectTheTriggerStatus',
                    defaultMessage: '请选择触发器状态',
                  }),
                  // 请选择触发器状态
                },
              ]}
              initialValue={TriggerState.enabled}
            >
              <Radio.Group>
                <Radio value={TriggerState.enabled}>
                  {
                    formatMessage({
                      id: 'odc.CreateTriggerPage.component.BaseInfoForm.Enable',
                      defaultMessage: '启用',
                    })

                    /* 启用 */
                  }
                </Radio>
                {enableTriggerAlterStatus && (
                  <Radio value={TriggerState.disabled}>
                    {
                      formatMessage({
                        id: 'odc.CreateTriggerPage.component.BaseInfoForm.Disable',
                        defaultMessage: '禁用',
                      })

                      /* 禁用 */
                    }
                  </Radio>
                )}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span="8">
            <Button size="small" type="primary" onClick={this.handleSubmit}>
              {
                formatMessage({
                  id: 'odc.CreateTriggerPage.component.BaseInfoForm.Determine',
                  defaultMessage: '确定',
                })

                /* 确定 */
              }
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default BaseInfoForm;
