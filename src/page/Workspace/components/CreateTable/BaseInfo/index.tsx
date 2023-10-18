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
import { Col, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { useContext, useEffect, useImperativeHandle } from 'react';
import { useTableConfig } from '../config';
import { getDefaultCollation } from '../helper';
import TableContext from '../TableContext';
import styles from './index.less';

interface IProps {
  isEdit?: boolean;
  formRef?: React.Ref<FormInstance<any>>;
}

const { Option } = Select;

const CreateTableBaseInfoForm: React.FC<IProps> = (props) => {
  const { isEdit, formRef } = props;

  const [form] = Form.useForm();
  const tableContext = useContext(TableContext);
  const model = tableContext.info;
  const session = tableContext.session;
  const { collations, charsets } = session;
  const config = useTableConfig(session.connection.dialectType);

  useEffect(() => {
    form.setFieldsValue(model);
  }, [model]);

  useImperativeHandle(
    formRef,
    () => {
      return form;
    },
    [form],
  );
  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      initialValues={null}
      onValuesChange={(cValue, values) => {
        if ('character' in cValue) {
          form.setFieldsValue({
            collation: getDefaultCollation(cValue.character, collations),
          });
        }
        tableContext.setInfo?.(form.getFieldsValue());
      }}
    >
      <Row gutter={12}>
        <Col span={11}>
          <Form.Item
            name="tableName"
            label={formatMessage({
              id: 'workspace.window.createTable.baseInfo.tableName',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.baseInfo.tableName.validation',
                }),
              },
            ]}
          >
            <Input
              autoFocus
              placeholder={formatMessage({
                id: 'workspace.window.createTable.baseInfo.tableName.placeholder',
              })}
            />
          </Form.Item>
        </Col>
        {config.enableTableCharsetsAndCollations && (
          <>
            <Col span={6}>
              <Form.Item
                name="character"
                label={formatMessage({
                  id: 'workspace.window.createTable.baseInfo.character',
                })}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  disabled={isEdit}
                  showSearch
                  onSelect={(v) => {
                    form.setFieldsValue({
                      collation: getDefaultCollation(v.toString(), collations),
                    });
                  }}
                >
                  {charsets?.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  return (
                    <Form.Item
                      name="collation"
                      label={formatMessage({
                        id: 'workspace.window.createTable.baseInfo.collation',
                      })}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'workspace.window.createTable.baseInfo.tableName.validation',
                          }),
                        },
                      ]}
                      shouldUpdate
                    >
                      <Select disabled={isEdit} showSearch>
                        {collations
                          ?.filter((c) => {
                            const character = getFieldValue('character') || 'utf8mb4';
                            return c.indexOf(character) > -1;
                          })
                          .map((c) => (
                            <Option key={c} value={c}>
                              {c}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
      <Row>
        <Form.Item
          name="comment"
          label={formatMessage({
            id: 'workspace.window.createTable.baseInfo.comment',
          })}
          style={{ width: '100%' }}
          requiredMark={'optional'}
        >
          <Input.TextArea
            style={{ width: '100%' }}
            autoSize={{ maxRows: 3, minRows: 3 }}
            placeholder={formatMessage({
              id: 'workspace.window.createTable.baseInfo.comment.placeholder',
            })}
          />
        </Form.Item>
      </Row>
    </Form>
  );
};

export default CreateTableBaseInfoForm;
