/*
 * Copyright 2024 OceanBase
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

import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { PureComponent } from 'react';

const { Option } = Select;

interface IProps {
  onSubmit: (values: any) => void;
  connectionMode?: ConnectionMode;
}
export default class BaseInfoForm extends PureComponent<IProps> {
  public handleSubmit = (values) => {
    this.props?.onSubmit(values);
  };

  private getCheckOptions = () => {
    const { connectionMode } = this.props;
    const isOracle = connectionMode === ConnectionMode.OB_ORACLE;
    const r = [
      {
        name: formatMessage({ id: 'odc.component.BaseInfoForm.No' }), // 无
        value: 'NONE',
      },
    ];

    if (isOracle) {
      r.push({
        name: formatMessage({ id: 'odc.component.BaseInfoForm.ReadOnly' }), // 只读
        value: 'READ_ONLY',
      });
    }
    return r;
  };

  public render() {
    const checkOptions = this.getCheckOptions();
    return (
      <Form
        layout="vertical"
        initialValues={{
          checkOption: checkOptions[0].value,
        }}
        onFinish={this.handleSubmit}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label={formatMessage({
                id: 'odc.component.BaseInfoForm.ViewName',
              })} /* 视图名称 */
              name="viewName"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.component.BaseInfoForm.EnterAViewName',
                  }), // 请输入视图名称
                },
              ]}
            >
              <Input
                autoFocus
                placeholder={formatMessage({
                  id: 'odc.component.BaseInfoForm.EnterAViewName',
                })} /* 请输入视图名称 */
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={formatMessage({
                id: 'odc.component.BaseInfoForm.CheckItem',
              })}
              /* 检查项 */ name="checkOption"
            >
              <Select style={{ width: 120 }}>
                {checkOptions.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit" style={{ marginTop: '4px' }}>
          {
            formatMessage({
              id: 'odc.component.BaseInfoForm.Determine',
            }) /* 确定 */
          }
        </Button>
      </Form>
    );
  }
}
