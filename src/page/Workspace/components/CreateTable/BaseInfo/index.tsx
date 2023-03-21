import React, { useContext, useEffect, useImperativeHandle } from 'react';
// compatible
import { Col, Form, Input, Row, Select } from 'antd';
// @ts-ignore
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { FormInstance } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import { useTableConfig } from '../config';
import { getDefaultCollation } from '../helper';
import TableContext from '../TableContext';
import styles from './index.less';

interface IProps {
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  isEdit?: boolean;
  formRef?: React.Ref<FormInstance<any>>;
}

const { Option } = Select;

const CreateTableBaseInfoForm: React.FC<IProps> = (props) => {
  const { isEdit, schemaStore, connectionStore, formRef } = props;
  const { collations, charsets } = schemaStore;
  const config = useTableConfig(connectionStore);
  const [form] = Form.useForm();
  const tableContext = useContext(TableContext);
  const model = tableContext.info;

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
                    message: formatMessage({
                      id: 'workspace.window.createTable.baseInfo.tableName.validation',
                    }),
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

export default inject('schemaStore', 'connectionStore')(observer(CreateTableBaseInfoForm));
