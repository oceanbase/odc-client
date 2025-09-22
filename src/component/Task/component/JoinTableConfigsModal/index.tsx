import { IDLMJobParametersTables, ITable } from '@/d.ts';
import { Modal, Form, Input, Button, Space, Select, Typography, Checkbox } from 'antd';
import { FormListFieldData } from 'antd/es/form/FormList';
import styles from './index.less';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import { useDBSession } from '@/store/sessionManager/hooks';
import { getTableInfo } from '@/common/network/table';
const { TextArea } = Input;

export default function JoinTableConfigModal({
  visible,
  initialValues,
  onCancel,
  onOk,
  name,
  databaseId,
}: {
  visible: boolean;
  initialValues?: IDLMJobParametersTables;
  onCancel: () => void;
  onOk: (values: any) => void;
  name?: string;
  databaseId: number;
}) {
  const [form] = Form.useForm();
  const [multiTableJoin, setMultiTableJoin] = useState(false);
  const [partition, setPartition] = useState(false);
  const [tableCanSetPartition, setTableCanSetPartition] = useState(false);
  const { session, database } = useDBSession(databaseId);
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
      setMultiTableJoin(!!initialValues?.joinTableConfigs?.length);
      setPartition(!!initialValues?.partitions);
    }
  }, [visible, initialValues]);

  useEffect(() => {
    if (session?.sessionId && database && visible) {
      getTablePartition();
    }
  }, [session?.sessionId, database, visible]);

  const getTablePartition = async () => {
    const table = await getTableInfo(
      initialValues?.tableName,
      database?.name,
      session?.sessionId,
      false,
    );
    setTableCanSetPartition(!!table?.partitions?.partType);
  };

  useEffect(() => {
    if (multiTableJoin) {
      form.setFieldValue('filterType', 'filterType');
    } else {
      form.setFieldValue('filterType', undefined);
    }
  }, [multiTableJoin]);

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
        <div>
          <Checkbox onChange={(e) => setMultiTableJoin(e.target.checked)} checked={multiTableJoin}>
            设置多表关联
          </Checkbox>
        </div>
        {multiTableJoin && (
          <>
            <Form.List name="joinTableConfigs">
              {(fields: FormListFieldData[], { add, remove }) => (
                <div className={styles.container}>
                  <div className={classNames(styles.tables, styles.header)}>
                    <div className={styles.column}>关联方式</div>
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
                        name={[name, 'joinType']}
                        style={{ marginBottom: 0, paddingRight: 6 }}
                        className={styles.column}
                      >
                        <Select
                          defaultValue={'join'}
                          options={[
                            {
                              label: 'join',
                              value: 'join',
                            },
                          ]}
                        />
                      </Form.Item>
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
                        style={{ marginBottom: 0, paddingRight: 6 }}
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
                      {fields?.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    {
                      formatMessage({
                        id: 'odc.DataArchiveTask.CreateModal.ArchiveRange.Add',
                        defaultMessage: '添加',
                      }) /*添加*/
                    }
                  </Button>
                </div>
              )}
            </Form.List>
            <Form.Item
              style={{ marginTop: 16 }}
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
              <Input placeholder={'请输入，可直接引用关联表名和字段'} />
            </Form.Item>
          </>
        )}

        {tableCanSetPartition && (
          <>
            <div>
              <Checkbox onChange={(e) => setPartition(e.target.checked)} checked={partition}>
                指定扫描分区
              </Checkbox>
            </div>
            {partition && (
              <Form.Item name={'partitions'}>
                <TextArea
                  autoSize={{ maxRows: 3 }}
                  placeholder={formatMessage({
                    id: 'src.component.Task.component.PartitionTextArea.51B4FB10',
                    defaultMessage: '请输入分区名称，多个分区间用英文逗号隔开',
                  })}
                />
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
}
