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

import { CaseInput } from '@/component/Input/Case';
import { columnGroupsText } from '@/constant/label';
import { ColumnStoreType, DBDefaultStoreType } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { Col, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { useContext, useEffect, useImperativeHandle } from 'react';
import { useDataSourceConfig, useTableConfig } from '../config';
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
  const config = useTableConfig(session.connection?.dialectType);
  const datasourceConfig = useDataSourceConfig(session.connection.type);
  const layout = session?.supportFeature?.enableColumnStore
    ? [8, 5, 6, 5].reverse()
    : [11, 6, 7].reverse();
  useEffect(() => {
    form.setFieldsValue(model);
  }, [model]);

  useEffect(() => {
    const dbStoreFormat = session?.params?.defaultTableStoreFormat;
    if (!dbStoreFormat || !session?.supportFeature?.enableColumnStore) {
      return;
    }
    let cg = [];
    switch (dbStoreFormat) {
      case DBDefaultStoreType.COLUMN: {
        cg = [ColumnStoreType.COLUMN];
        break;
      }
      case DBDefaultStoreType.ROW: {
        cg = [ColumnStoreType.ROW];
        break;
      }
      case DBDefaultStoreType.COMPOUND: {
        cg = [ColumnStoreType.COLUMN, ColumnStoreType.ROW];
        break;
      }
    }
    form.setFieldsValue({
      columnGroups: cg,
    });
  }, [session?.params?.defaultTableStoreFormat]);

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
        <Col span={layout.pop()}>
          <Form.Item
            name="tableName"
            label={formatMessage({
              id: 'workspace.window.createTable.baseInfo.tableName',
              defaultMessage: '表名称',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.baseInfo.tableName.validation',
                  defaultMessage: '请填写表名称',
                }),
              },
            ]}
          >
            <CaseInput
              caseSensitive={datasourceConfig?.sql?.caseSensitivity}
              escapes={datasourceConfig?.sql?.escapeChar}
              autoFocus
              placeholder={formatMessage({
                id: 'workspace.window.createTable.baseInfo.tableName.placeholder',
                defaultMessage: '请填写表名称',
              })}
            />
          </Form.Item>
        </Col>
        {config.enableTableCharsetsAndCollations && (
          <>
            <Col span={layout.pop()}>
              <Form.Item
                name="character"
                label={formatMessage({
                  id: 'workspace.window.createTable.baseInfo.character',
                  defaultMessage: '默认字符集',
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
            <Col span={layout.pop()}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  return (
                    <Form.Item
                      name="collation"
                      label={formatMessage({
                        id: 'workspace.window.createTable.baseInfo.collation',
                        defaultMessage: '默认排序规则',
                      })}
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'workspace.window.createTable.baseInfo.tableName.validation',
                            defaultMessage: '请填写表名称',
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

        {session?.supportFeature?.enableColumnStore ? (
          <Col span={layout.pop()}>
            <Form.Item
              name="columnGroups"
              label={formatMessage({
                id: 'src.page.Workspace.components.CreateTable.BaseInfo.3907128F',
                defaultMessage: '存储模式',
              })}
            >
              <Select
                mode="multiple"
                showSearch
                allowClear
                options={[
                  {
                    value: ColumnStoreType.COLUMN,
                    label: columnGroupsText[ColumnStoreType.COLUMN],
                  },
                  { value: ColumnStoreType.ROW, label: columnGroupsText[ColumnStoreType.ROW] },
                ]}
              />
            </Form.Item>
          </Col>
        ) : null}
      </Row>
      <Row>
        <Form.Item
          name="comment"
          label={formatMessage({
            id: 'workspace.window.createTable.baseInfo.comment',
            defaultMessage: '描述',
          })}
          style={{ width: '100%' }}
          requiredMark={'optional'}
        >
          <Input.TextArea
            style={{ width: '100%' }}
            autoSize={{ maxRows: 3, minRows: 3 }}
            placeholder={formatMessage({
              id: 'workspace.window.createTable.baseInfo.comment.placeholder',
              defaultMessage: '请填写描述',
            })}
          />
        </Form.Item>
      </Row>
    </Form>
  );
};

export default CreateTableBaseInfoForm;
