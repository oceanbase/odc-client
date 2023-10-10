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

import { ISQLScript } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';

interface IProps {
  onSave: (values: ISQLScript) => Promise<void>;
  visible: boolean;
  onCancel: () => void;
}

class SaveSQLModal extends Component<IProps> {
  state: Readonly<{ saving: boolean }> = {
    saving: false,
  };
  public formRef = React.createRef<FormInstance>();

  public handleSubmit = (e) => {
    const { onSave } = this.props;
    this.formRef.current
      .validateFields()
      .then(async (data) => {
        this.setState({
          saving: true,
        });
        await onSave(data);
        this.setState({
          saving: false,
        });
      })
      .catch((error) => {
        this.setState({
          saving: false,
        });
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const initialValues = {
      objectName: '',
    };

    return (
      <Modal
        destroyOnClose
        title={
          formatMessage({ id: 'odc.component.SaveSQLModal.SaveScript' }) //保存脚本
        }
        open={visible}
        confirmLoading={this.state.saving}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        centered
      >
        <Form {...formItemLayout} initialValues={initialValues} ref={this.formRef}>
          <Form.Item
            required
            name="objectName"
            label={
              formatMessage({ id: 'odc.component.SaveSQLModal.ScriptName' }) //脚本名称
            }
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.SaveSQLModal.TheScriptNameMustBe',
                }), //脚本名称不能为空
              },
              {
                pattern: /^[\S]*$/,
                message: formatMessage({
                  id: 'odc.component.SaveSQLModal.CannotContainBlankCharacters',
                }),
              },
            ]}
          >
            <Input
              placeholder={
                formatMessage({
                  id: 'odc.component.SaveSQLModal.EnterAScriptName',
                })
                //请输入脚本名称
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default SaveSQLModal;
