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

import { formatMessage } from '@/util/intl';
import { Form, Input, Popover, Switch } from 'antd';
import React, { useContext, useEffect } from 'react';
import RecyleConfigContext from '../context/RecyleConfigContext';

interface IProps {}

const RecycleConfig: React.FC<IProps> = function ({ children }) {
  const [form] = Form.useForm();
  const context = useContext(RecyleConfigContext);
  useEffect(() => {
    if (!context.setting) {
      return;
    }
    form.setFieldsValue(context.setting);
  }, [context.setting]);
  return (
    <Popover
      placement="bottomRight"
      overlayStyle={{ minWidth: 180 }}
      content={
        <Form
          layout="vertical"
          form={form}
          initialValues={context.setting}
          onValuesChange={(_, values) => {
            context.changeSetting(values);
          }}
        >
          <Form.Item
            name={'recyclebinEnabled'}
            valuePropName="checked"
            label={formatMessage({
              id: 'odc.RecycleBinPage.RecyleConfig.EnableRecycleBin',
            })} /*启用回收站*/
          >
            <Switch />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const recyclebinEnabled = getFieldValue('recyclebinEnabled');
              const objectExpireTime = getFieldValue('objectExpireTime');
              return recyclebinEnabled ? (
                <>
                  <Form.Item
                    name={'truncateFlashbackEnabled'}
                    valuePropName="checked"
                    label={formatMessage({
                      id: 'odc.RecycleBinPage.RecyleConfig.SupportTruncateTable',
                    })} /*支持 Truncate Table*/
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    shouldUpdate
                    label={formatMessage({
                      id: 'odc.RecycleBinPage.RecyleConfig.RecycleBinRetentionTime',
                    })} /*回收站保留时间*/
                  >
                    <Input
                      value={
                        objectExpireTime === '0s'
                          ? formatMessage({
                              id: 'odc.RecycleBinPage.RecyleConfig.Permanent',
                            }) //永久
                          : objectExpireTime
                      }
                      disabled
                      style={{ width: 150 }}
                    />
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>
        </Form>
      }
    >
      {children}
    </Popover>
  );
};

export default RecycleConfig;
