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

import {
  ITableColumn,
  ITriggerAdancedInfoForm,
  TriggerEvents,
  TriggerGrade,
  TriggerMode,
  TriggerType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Checkbox, Col, Divider, Form, Input, Radio, Row, Select, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';
import { Step, StepStatus } from '../type';

const { Option } = Select;
interface IProps {
  columns: ITableColumn[];
  initialValues: ITriggerAdancedInfoForm;
  enableTriggerReferences: boolean;
  onSave: (step: Step, info: any) => void;
  setStepStatus: (step: Step, status: StepStatus) => void;
  setFormRef: (ref: FormInstance) => void;
}

interface IState {
  disabledSubmit: boolean;
  hasUpdate: boolean;
}

class AdvancedInfoForm extends Component<IProps, IState> {
  private formRef = React.createRef<FormInstance>();

  state = {
    disabledSubmit: true,
    hasUpdate: false,
  };

  componentDidMount() {
    const { initialValues } = this.props;
    this.props.setFormRef(this.formRef as any);
    this.setState({
      hasUpdate: initialValues?.triggerEvents?.includes(TriggerEvents.UPDATE) ?? false,
    });
  }

  handleSubmit = () => {
    this.formRef.current
      .validateFields()
      .then((values) => {
        this.props.onSave(Step.ADVANCED, values);
      })
      .catch((errorInfo) => {
        throw new Error(errorInfo);
      });
  };

  handleChange = () => {
    const triggerEvents = this.formRef.current.getFieldValue('triggerEvents') || [];
    this.setState({
      disabledSubmit: false,
      hasUpdate: triggerEvents.includes(TriggerEvents.UPDATE),
    });

    this.props.setStepStatus(Step.ADVANCED, StepStatus.EDITING);
  };

  handleAllChange = (e) => {
    const { columns } = this.props;
    const triggerColumns = [];
    if (e.target.checked) {
      columns.forEach((column: ITableColumn) => {
        triggerColumns.push(column.columnName);
      });
    }
    this.formRef.current?.setFieldsValue({
      triggerColumns,
    });
  };

  render() {
    const { columns, initialValues = {}, enableTriggerReferences } = this.props;
    const { disabledSubmit, hasUpdate } = this.state;
    return (
      <Form
        ref={this.formRef}
        requiredMark={'optional'}
        initialValues={initialValues}
        layout="vertical"
      >
        <Space size={32}>
          <Form.Item
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.TriggerType',
            })}
            /* 触发器类型 */
            name="triggerType"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.SelectATriggerType',
                }), // 请选择触发器类型
              },
            ]}
            initialValue="SIMPLE"
          >
            <Radio.Group onChange={this.handleChange}>
              <Radio value={TriggerType.SIMPLE}>{TriggerType.SIMPLE}</Radio>
              {
                // <Radio value="COMPOUND">COMPOUND</Radio>
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item
            style={{
              width: '180px',
            }}
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.Trigger',
            })}
            /* 触发 */
            name="triggerMode"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.SelectTrigger',
                }), // 请选择触发
              },
            ]}
            initialValue="AFTER"
          >
            <Radio.Group onChange={this.handleChange}>
              <Radio value={TriggerMode.BEFORE}>{TriggerMode.BEFORE}</Radio>
              <Radio value={TriggerMode.AFTER}>{TriggerMode.AFTER}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.Level',
            })}
            /* 级别 */
            name="triggerGrade"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.SelectALevel',
                }), // 请选择级别
              },
            ]}
            initialValue={TriggerGrade.ROW}
          >
            <Radio.Group onChange={this.handleChange}>
              <Radio value={TriggerGrade.ROW}>
                {
                  formatMessage({
                    id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.RowLevel',
                  })
                  /* 行级 */
                }
              </Radio>
              {
                // <Radio value="lang">语句级</Radio>
              }
            </Radio.Group>
          </Form.Item>
        </Space>
        <Row gutter={24}>
          <Col span="24">
            <Form.Item
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.Event',
              })}
              /* 事件 */
              name="triggerEvents"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.SelectAtLeastOneEvent',
                  }),
                  // 请至少选择一个事件
                },
              ]}
            >
              <Checkbox.Group onChange={this.handleChange}>
                <Checkbox value={TriggerEvents.INSERT}>{TriggerEvents.INSERT}</Checkbox>
                <Checkbox value={TriggerEvents.UPDATE}>{TriggerEvents.UPDATE}</Checkbox>
                <Checkbox value={TriggerEvents.DELETE}>{TriggerEvents.DELETE}</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
        </Row>
        {hasUpdate && (
          <Row>
            <Col span="24">
              <Form.Item
                label={formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ColumnOptional',
                })} /* 列 */
                name="triggerColumns"
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'odc.components.CreateTriggerPage.SelectUpdateEventTheColumn',
                    }),
                  },
                ]}

                /* 选择UPDATE事件，列不能为空 */
              >
                <Select
                  onChange={this.handleChange}
                  mode="multiple"
                  dropdownRender={(menu) => (
                    <div>
                      <Checkbox onChange={this.handleAllChange} style={{ paddingLeft: '12px' }}>
                        {
                          formatMessage({
                            id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.SelectAll',
                          }) /* 全选 */
                        }
                      </Checkbox>
                      <Divider style={{ margin: '4px 0' }} />
                      {menu}
                    </div>
                  )}
                >
                  {columns.map((col) => {
                    return (
                      <Option key={col.columnName} value={col.columnName}>
                        {col.columnName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={24}>
          <Col xl={{ span: '4' }} span="6">
            <Form.Item
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ReferenceOldValuesOptional',
              })}
              /* 引用旧值 */ name="referencesOldValue"
            >
              <Input
                onChange={this.handleChange}
                placeholder={formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ReferenceOldValues',
                })}
                /* 引用旧值 */
                disabled={!enableTriggerReferences}
              />
            </Form.Item>
          </Col>
          <Col
            xl={{ span: '4' }}
            span="6"
            style={{
              paddingRight: '0',
            }}
          >
            <Form.Item
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ReferenceNewValueOptional',
              })}
              /* 引用新值 */ name="referencesNewValue"
            >
              <Input
                onChange={this.handleChange}
                placeholder={formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ReferenceANewValue',
                })}
                /* 引用新值 */
                disabled={!enableTriggerReferences}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col xl={{ span: '4' }} span="6">
            <Form.Item
              label={formatMessage({
                id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ClauseConditionOptional',
              })}
              /* 子句条件（选填） */ name="sqlExpression"
            >
              <Input
                onChange={this.handleChange}
                placeholder={formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.ClauseCondition',
                })}

                /* 子句条件 */
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span="8">
            <Button
              disabled={disabledSubmit}
              size="small"
              type="primary"
              onClick={this.handleSubmit}
            >
              {
                formatMessage({
                  id: 'odc.CreateTriggerPage.component.AdvancedInfoFrom.Determine',
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

export default AdvancedInfoForm;
