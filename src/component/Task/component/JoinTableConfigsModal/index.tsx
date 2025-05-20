import { IDLMJobParametersTables } from '@/d.ts';
import { Modal, Form, Input, Button, Space, Select, Typography } from 'antd';
import { FormListFieldData } from 'antd/es/form/FormList';
import styles from './index.less';
import classNames from 'classnames';
import { useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';

export default function JoinTableConfigModal({
  visible,
  initialValues,
  onCancel,
  onOk,
}: {
  visible: boolean;
  initialValues?: IDLMJobParametersTables;
  onCancel: () => void;
  onOk: (values: any) => void;
}) {
  const [form] = Form.useForm();

  const getInitialValues = () => {
    return {
      ...initialValues,
      joinTableConfigs: initialValues?.joinTableConfigs?.length
        ? initialValues?.joinTableConfigs
        : [{ tableName: '', joinCondition: '' }],
      filterType: 'relationTable',
    };
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(getInitialValues());
    }
  }, [visible, initialValues]);

  return (
    <Modal
      title={formatMessage({
        id: 'src.component.Task.component.JoinTableConfigsModal.F43041F0',
        defaultMessage: '更多过滤条件设置',
      })}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        initialValues={getInitialValues()}
        layout="vertical"
        preserve={false}
        onFinish={onOk}
      >
        <div className={styles.tableName}>
          {formatMessage({
            id: 'src.component.Task.component.JoinTableConfigsModal.0D345FF1',
            defaultMessage: '归档表:',
          })}
          {initialValues?.tableName || '-'}
        </div>
        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.component.JoinTableConfigsModal.829861F8',
            defaultMessage: '过滤条件类型',
          })}
          name="filterType"
        >
          <Select
            options={[
              {
                label: formatMessage({
                  id: 'src.component.Task.component.JoinTableConfigsModal.24B9E931',
                  defaultMessage: '关联表',
                }),
                value: 'relationTable',
              },
            ]}
          />
        </Form.Item>
        <Form.List name="joinTableConfigs">
          {(fields: FormListFieldData[], { add, remove }) => (
            <div className={styles.container}>
              <div className={classNames(styles.tables, styles.header)}>
                <div className={styles.column}>
                  {formatMessage({
                    id: 'src.component.Task.component.JoinTableConfigsModal.B97ACBEB',
                    defaultMessage: '关联表名',
                  })}
                </div>
                <div className={styles.column}>
                  {formatMessage({
                    id: 'src.component.Task.component.JoinTableConfigsModal.8ED2D92E',
                    defaultMessage: '关联条件',
                  })}
                </div>
                <div className={styles.action}></div>
              </div>

              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className={classNames(styles.tables, {
                    [styles.delete]: fields.length > 1,
                  })}
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'tableName']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.component.JoinTableConfigsModal.4DC642F8',
                          defaultMessage: '请输入表名',
                        }),
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                    className={styles.column}
                  >
                    <Input
                      placeholder={formatMessage({
                        id: 'src.component.Task.component.JoinTableConfigsModal.3693087B',
                        defaultMessage: '请输入',
                      })}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'joinCondition']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'src.component.Task.component.JoinTableConfigsModal.DD1AB5CB',
                          defaultMessage: '请输入关联条件',
                        }),
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                    className={styles.column}
                  >
                    <Input
                      placeholder={formatMessage({
                        id: 'src.component.Task.component.JoinTableConfigsModal.4DB23955',
                        defaultMessage: '请输入表达式 ，如 tableA.col1=tableB.col2',
                      })}
                    />
                  </Form.Item>

                  <Button
                    type="link"
                    onClick={() => remove(name)}
                    className={styles.deleteBtn}
                    disabled={name === 0}
                  >
                    {formatMessage({
                      id: 'src.component.Task.component.JoinTableConfigsModal.7A66FCAE',
                      defaultMessage: '移除',
                    })}
                  </Button>
                </div>
              ))}
              <div className={styles.operationContainer}>
                <Button
                  onClick={() => add()}
                  type="link"
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  {
                    formatMessage({
                      id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Add',
                      defaultMessage: '添加',
                    }) /*添加*/
                  }
                </Button>
              </div>
            </div>
          )}
        </Form.List>
        <Form.Item
          label={
            <Space>
              {formatMessage({
                id: 'src.component.Task.component.JoinTableConfigsModal.A7BA6701',
                defaultMessage: '过滤条件',
              })}
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.component.Task.component.JoinTableConfigsModal.7D5E49E8',
                  defaultMessage: '可直接引用关联表名和字段',
                })}
              </Typography.Text>
            </Space>
          }
          name="conditionExpression"
        >
          <Input
            placeholder={formatMessage({
              id: 'src.component.Task.component.JoinTableConfigsModal.94EDBB8B',
              defaultMessage: '请输入',
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
