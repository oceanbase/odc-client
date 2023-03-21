import React, { useImperativeHandle, useState } from 'react';
import { formatMessage, FormattedMessage } from 'umi';
// compatible
import { ConnectionMode, ITable } from '@/d.ts';
import { Button, Col, Divider, Form, Input, Row, Select } from 'antd';
// @ts-ignore
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { FormInstance, useForm } from 'antd/es/form/Form';
import { inject, observer } from 'mobx-react';
import styles from './index.less';

interface IProps {
  model: Partial<ITable>;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  isEdit?: boolean;
  formRef?: React.Ref<FormInstance<any>>;
  onSave: (values: ITable) => void;
}

const { Option } = Select;

const CreateTableBaseInfoForm: React.FC<IProps> = (props) => {
  const { model, isEdit, schemaStore, connectionStore, formRef } = props;
  const { collations, charsets } = schemaStore;
  const enableCharsetsAndCollations =
    connectionStore.connection?.dbMode !== ConnectionMode.OB_ORACLE;
  const [modified, setModified] = useState(false);
  const [form] = useForm();
  function getDefaultCollation(character: string) {
    return (
      collations?.find((collation) => {
        const _character = character || 'utf8mb4';
        return collation.indexOf(_character) > -1;
      }) || 'utf8mb4_general_ci'
    );
  }
  async function handleSubmit() {
    const { onSave } = props;
    const data = await form.validateFields();
    if (data) {
      onSave(data);
    }
  }

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
      initialValues={{
        tableName: model.tableName,
        character: model.character || 'utf8mb4',
        collation: model.collation || getDefaultCollation(model.character),
        comment: model.comment,
      }}
      onValuesChange={() => setModified(true)}
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
              disabled={isEdit}
              placeholder={formatMessage({
                id: 'workspace.window.createTable.baseInfo.tableName.placeholder',
              })}
            />
          </Form.Item>
        </Col>
        {enableCharsetsAndCollations && (
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
                      collation: getDefaultCollation(v.toString()),
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
      {!isEdit && (
        <>
          <Divider className={styles.divider} />
          <Button
            disabled={!modified}
            size="small"
            onClick={handleSubmit}
            type="primary"
            className={styles.submitButton}
          >
            <FormattedMessage id="app.button.ok" />
          </Button>
        </>
      )}
    </Form>
  );
};

export default inject('schemaStore', 'connectionStore')(observer(CreateTableBaseInfoForm));
