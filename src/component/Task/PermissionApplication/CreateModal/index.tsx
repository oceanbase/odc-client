import { ConnectionStore } from '@/store/connection';
import { ModalStore } from '@/store/modal';
import type { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import styles from './index.less';

export enum IPartitionPlanInspectTriggerStrategy {
  EVERY_DAY = 'EVERY_DAY',
  FIRST_DAY_OF_MONTH = 'FIRST_DAY_OF_MONTH',
  LAST_DAY_OF_MONTH = 'LAST_DAY_OF_MONTH',
  NONE = 'NONE',
}

// 4.0.0 版本不支持 巡检周期设置
export const enabledInspectTriggerStrategy = false;

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  connectionStore?: ConnectionStore;
  schemaStore?: SchemaStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = inject(
  'modalStore',
  'connectionStore',
  'schemaStore',
)(
  observer((props) => {
    const {
      modalStore,
      connectionStore: { connection },
      schemaStore,
      projectId,
    } = props;
    const { sensitiveColumnVisible } = modalStore;
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [disabledSubmit, setDisabledSubmit] = useState(true);
    const [initialValue, setInitialValue] = useState({});
    const [form] = Form.useForm();

    const loadData = async () => {};

    const onClose = useCallback(() => {
      form.resetFields();
      setDisabledSubmit(true);
      modalStore.changeSensitiveColumnVisible(false);
    }, [modalStore]);

    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: '确认取消新建敏感列申请吗？',
        centered: true,
        onOk() {
          onClose();
        },
      });
    }, [onClose]);

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        console.log(values);
        // const { connectionId, description } = values;
        // // 4.0.0 禁止设置 巡检周期，保留一个默认值：无需巡检
        // const inspectTriggerStrategy = IPartitionPlanInspectTriggerStrategy.NONE;
        // const params = {
        //   taskType: TaskType.PARTITION_PLAN,
        //   databaseName: schemaStore.database.name,
        //   description,
        //   connectionId,
        //   parameters: {
        //     connectionPartitionPlan: {
        //       connectionId,
        //       inspectEnable: inspectTriggerStrategy !== IPartitionPlanInspectTriggerStrategy.NONE,
        //       inspectTriggerStrategy,
        //       tablePartitionPlans: partitionPlans,
        //     },
        //   },
        // };

        setConfirmLoading(true);
        // const resCount = await createTask(params);
        setConfirmLoading(false);
        onClose();
        // if (resCount) {
        //   onClose();
        //   openTasksPage(TaskPageType.PARTITION_PLAN, TaskPageScope.CREATED_BY_CURRENT_USER);
        // }
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Drawer
        visible={sensitiveColumnVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={724}
        title={'新建敏感列申请'}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.components.PartitionDrawer.Cancel',
                }) /*取消*/
              }
            </Button>
            <Tooltip
              title={
                disabledSubmit
                  ? formatMessage({
                      id: 'odc.components.PartitionDrawer.SetPartitionPoliciesForAll',
                    }) //请设置所有 Range 分区表的分区策略
                  : null
              }
            >
              <Button
                // disabled={disabledSubmit}
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {
                  formatMessage({
                    id: 'odc.components.PartitionDrawer.Submit',
                  }) /*提交*/
                }
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional" initialValues={{}}>
          <Form.Item label={'选择敏感列'} required>
            <div style={{ display: 'flex', columnGap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '153px' }}>数据源</span>
              <span style={{ width: '153px' }}>数据库</span>
              <span style={{ width: '153px' }}>表</span>
              <span style={{ width: '153px' }}>列</span>
            </div>
            <Form.List
              name="sensitiveColumn"
              initialValue={[
                {
                  // dataSource: '',
                  // database: '',
                  // tableName: '',
                  // columnName: '',
                  // maskingAlgorithm: '',
                },
              ]}
            >
              {(fields, { add, remove, move }, { errors }) => (
                <>
                  {fields.map(({ key, name, fieldKey }: any, index: number) => {
                    const showLabel = index === 0;
                    return (
                      <div
                        key={key}
                        className={styles.formItem}
                        style={{ display: 'flex', columnGap: '8px' }}
                      >
                        <Form.Item
                          required
                          name={[name, 'dataSource']}
                          // label={showLabel ? '数据源' : ''}
                          fieldKey={[fieldKey, 'dataSource']}
                          rules={[
                            {
                              required: true,
                              message: 'test',
                            },
                          ]}
                        >
                          <Select placeholder={'请选择'} style={{ width: '153px' }} />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'database']}
                          // label={showLabel ? '数据库' : ''}
                          fieldKey={[fieldKey, 'database']}
                        >
                          <Select placeholder={'请选择'} style={{ width: '153px' }} />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'tableName']}
                          // label={showLabel ? '表' : ''}
                          fieldKey={[fieldKey, 'tableName']}
                        >
                          <Select placeholder={'请选择'} style={{ width: '153px' }} />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'columnName']}
                          // label={showLabel ? '列' : ''}
                          fieldKey={[fieldKey, 'columnName']}
                        >
                          <Select placeholder={'请选择'} style={{ width: '153px' }} />
                        </Form.Item>
                        {fields.length > 1 ? (
                          <div
                            style={{
                              height: '29px',
                              alignSelf: 'flex-end',
                              display: 'flex',
                              justifyContent: 'center',
                              alignContent: 'center',
                            }}
                          >
                            <DeleteOutlined
                              className={styles.deleteBtn}
                              onClick={() => remove(index)}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  <Button type="dashed" block onClick={add} style={{ width: '628px' }}>
                    添加
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name={'expireTime'} label={'选择有效期'} required>
            <Radio.Group
              options={[
                {
                  label: '7天',
                  value: '7d',
                },
                {
                  label: '30天',
                  value: '30d',
                },
                {
                  label: '半年',
                  value: 'hy',
                },
                {
                  label: '一年',
                  value: '1y',
                },
                {
                  label: '三年',
                  value: '3y',
                },
                {
                  label: '自定义',
                  value: 'custom',
                },
              ]}
            ></Radio.Group>
            <InputNumber />
          </Form.Item>
          <Form.Item name={'range'} required label="选择生效范围">
            <Checkbox.Group
              options={[
                {
                  label: 'SQL 窗口查询',
                  value: 'sql-window',
                },
                {
                  label: '导出',
                  value: 'export',
                },
                {
                  label: '数据库变更',
                  value: 'databaseChange',
                },
              ]}
            ></Checkbox.Group>
          </Form.Item>
          <Form.Item name={'tip'} label={'备注'}>
            <Input.TextArea placeholder="请输入" rows={3} />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }),
);

export default CreateModal;
