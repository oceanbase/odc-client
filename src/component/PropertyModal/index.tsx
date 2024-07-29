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

import { IConnectionProperty, IConnectionPropertyType } from '@/d.ts';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Alert, Form, Input, InputNumber, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './index.less';
const { Option } = Select;
interface IProps {
  model: Partial<IConnectionProperty>;
  settingStore?: SettingStore;
  onSave: (values: IConnectionProperty) => void;
  visible: boolean;
  onCancel: () => void;
}

const formItemProps = {
  name: 'value',
  label: formatMessage({
    id: 'workspace.window.session.form.value',
    defaultMessage: '值',
  }),
  style: {
    marginBottom: 0,
  },
  rules: [
    {
      required: true,
      message: formatMessage({
        id: 'workspace.window.session.form.value.validation',
        defaultMessage: '请填写变量值',
      }),
    },
  ],
};

class PropertyModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { onSave } = this.props;
    this.formRef.current
      .validateFields()
      .then((data) => {
        onSave(data);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, model, settingStore, onCancel } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 6,
      },

      wrapperCol: {
        span: 14,
      },
    };

    const { valueType, valueEnums, value } = model;
    const isAutocommit = model.key?.toLowerCase?.() == 'autocommit';
    const isShowAutocommitTip = false;
    const initialValues = {
      value,
    };

    return (
      <Modal
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.session.modal.title',
          defaultMessage: '编辑变量',
        })}
        open={visible}
        onOk={this.save}
        onCancel={onCancel}
      >
        {isShowAutocommitTip && (
          <Alert
            type="warning"
            showIcon
            message={formatMessage({
              id: 'odc.component.PropertyModal.RiskTips',
              defaultMessage: '风险提示',
            })}
            /*风险提示*/
            style={{
              marginBottom: 12,
            }}
            description={
              <div>
                <div>
                  {
                    formatMessage({
                      id: 'odc.component.PropertyModal.TheSharedSessionModeIs',
                      defaultMessage: '当前为共享 Session 模式，因此：',
                    }) /*当前使用的是共享 Session 模式，因此：*/
                  }
                </div>
                <div>
                  {
                    formatMessage({
                      id: 'odc.component.PropertyModal.WhenTheValueIsOff',
                      defaultMessage:
                        '1、当该值为 OFF\n                  时：主动触发提交/回滚操作；或通过产品功能创建、修改、删除数据库对象，执行 DDL\n                  语句被动触发提交操作，会在所有窗口生效。',
                    })
                    /*1、当该值为 OFF
              时：主动触发提交/回滚操作；或通过产品功能创建、修改、删除数据库对象，执行 DDL
              语句被动触发提交操作，会在所有窗口生效。*/
                  }
                </div>
                <div>
                  {
                    formatMessage({
                      id: 'odc.component.PropertyModal.WhenTheValueIsOn',
                      defaultMessage: '2、当该值为 ON 时：如存在未提交的内容，会默认自动提交。',
                    })
                    /*2、当该值为 ON 时：如果存在未提交的内容，会默认自动提交。*/
                  }
                </div>
              </div>
            }
          />
        )}

        <Form {...formItemLayout} initialValues={initialValues} ref={this.formRef}>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.session.form.key',
              defaultMessage: '变量名',
            })}
          >
            <span className="ant-form-text">{model.key}</span>
          </Form.Item>

          {(!valueType || valueType === IConnectionPropertyType.STRING) && (
            <Form.Item {...formItemProps}>
              <Input
                placeholder={formatMessage({
                  id: 'workspace.window.session.form.value.placeholder',
                  defaultMessage: '请填写变量值',
                })}
              />
            </Form.Item>
          )}

          {valueType === IConnectionPropertyType.NUMERIC && (
            <>
              <Form.Item {...formItemProps}>
                <InputNumber
                  className={styles.unit}
                  style={{
                    width: 180,
                  }}
                  addonAfter={<span>{model.unit}</span>}
                />
              </Form.Item>
            </>
          )}

          {valueType === IConnectionPropertyType.ENUM && (
            <Form.Item {...formItemProps}>
              <Select>
                {valueEnums &&
                  valueEnums.map((v) => (
                    <Option key={v} value={v}>
                      {v}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}

export default inject('settingStore')(observer(PropertyModal));
