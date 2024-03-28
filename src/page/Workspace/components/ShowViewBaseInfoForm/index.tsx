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

import { IView } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Select } from 'antd';
import { Component, useEffect } from 'react';
import styles from './index.less';

enum CheckOption {
  NONE = 'NONE',
}

interface IProps {
  model: Partial<IView>;
}

const { Option } = Select;

function ShowViewBaseInfoForm({ model }: IProps) {
  const { viewName } = model ?? {};
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  useEffect(() => {
    if (!model) {
      return;
    }
    const { viewName, checkOption, definer, comment } = model;
    form.setFieldsValue({
      viewName: viewName,
      checkOption: checkOption || CheckOption.NONE,
      definer: definer,
      comment,
    });
  }, [model]);

  if (!viewName) {
    return null;
  }

  return (
    <Form form={form} {...formItemLayout} className={styles.form}>
      <Form.Item
        name="viewName"
        label={formatMessage({ id: 'workspace.window.createView.viewName' })}
      >
        <Input
          disabled={true}
          placeholder={formatMessage({
            id: 'workspace.window.createView.viewName.placeholder',
          })}
        />
      </Form.Item>
      <Form.Item
        name="checkOption"
        label={formatMessage({
          id: 'workspace.window.createView.checkOption',
        })}
      >
        <Select disabled={true}>
          <Option value={CheckOption.NONE}>{CheckOption.NONE}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="definer"
        label={formatMessage({ id: 'workspace.window.createView.definer' })}
      >
        <Input disabled={true} />
      </Form.Item>
      <Form.Item
        name="comment"
        label={formatMessage({
          id: 'src.page.Workspace.components.ShowViewBaseInfoForm.BAFEE497',
        })}
      >
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} disabled={true} />
      </Form.Item>
    </Form>
  );
}

export default ShowViewBaseInfoForm;
