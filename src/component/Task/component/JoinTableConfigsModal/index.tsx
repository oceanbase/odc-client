import { IDataArchiveJobParameters, IDLMJobParametersTables } from '@/d.ts';
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
      title="更多过滤条件设置"
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
        <div className={styles.tableName}>归档表: {initialValues?.tableName || '-'}</div>
        <Form.Item label="过滤条件类型" name="filterType">
          <Select options={[{ label: '关联表', value: 'relationTable' }]} />
        </Form.Item>
        <Form.List name="joinTableConfigs">
          {(fields: FormListFieldData[], { add, remove }) => (
            <div className={styles.container}>
              <div className={classNames(styles.tables, styles.header)}>
                <div className={styles.column}>关联表名</div>
                <div className={styles.column}>关联条件</div>
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
                    rules={[{ required: true, message: '请输入表名' }]}
                    style={{ marginBottom: 0 }}
                    className={styles.column}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'joinCondition']}
                    rules={[{ required: true, message: '请输入关联条件' }]}
                    style={{ marginBottom: 0 }}
                    className={styles.column}
                  >
                    <Input placeholder="请输入表达式 ，如 tableA.col1=tableB.col2" />
                  </Form.Item>

                  <Button
                    type="link"
                    onClick={() => remove(name)}
                    className={styles.deleteBtn}
                    disabled={name === 0}
                  >
                    移除
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
              过滤条件<Typography.Text type="secondary">可直接引用关联表名和字段</Typography.Text>
            </Space>
          }
          name="conditionExpression"
        >
          <Input placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
