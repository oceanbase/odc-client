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

import { ModalStore } from '@/store/modal';
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
  projectId?: number;
}

const CreateModal: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, projectId } = props;
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
        title: formatMessage({ id: 'odc.PermissionApplication.CreateModal.AreYouSureYouWant' }), //确认取消新建敏感列申请吗？
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
        open={sensitiveColumnVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={724}
        title={
          formatMessage({
            id: 'odc.PermissionApplication.CreateModal.CreateASensitiveColumnRequest',
          }) //新建敏感列申请
        }
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
          <Form.Item
            label={
              formatMessage({ id: 'odc.PermissionApplication.CreateModal.SelectSensitiveColumns' }) //选择敏感列
            }
            required
          >
            <div style={{ display: 'flex', columnGap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '153px' }}>
                {
                  formatMessage({
                    id: 'odc.PermissionApplication.CreateModal.DataSource',
                  }) /*数据源*/
                }
              </span>
              <span style={{ width: '153px' }}>
                {formatMessage({ id: 'odc.PermissionApplication.CreateModal.Database' }) /*数据库*/}
              </span>
              <span style={{ width: '153px' }}>
                {formatMessage({ id: 'odc.PermissionApplication.CreateModal.Table' }) /*表*/}
              </span>
              <span style={{ width: '153px' }}>
                {formatMessage({ id: 'odc.PermissionApplication.CreateModal.Column' }) /*列*/}
              </span>
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
                          <Select
                            placeholder={
                              formatMessage({
                                id: 'odc.PermissionApplication.CreateModal.PleaseSelect',
                              }) //请选择
                            }
                            style={{ width: '153px' }}
                          />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'database']}
                          // label={showLabel ? '数据库' : ''}
                          fieldKey={[fieldKey, 'database']}
                        >
                          <Select
                            placeholder={
                              formatMessage({
                                id: 'odc.PermissionApplication.CreateModal.PleaseSelect',
                              }) //请选择
                            }
                            style={{ width: '153px' }}
                          />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'tableName']}
                          // label={showLabel ? '表' : ''}
                          fieldKey={[fieldKey, 'tableName']}
                        >
                          <Select
                            placeholder={
                              formatMessage({
                                id: 'odc.PermissionApplication.CreateModal.PleaseSelect',
                              }) //请选择
                            }
                            style={{ width: '153px' }}
                          />
                        </Form.Item>
                        <Form.Item
                          required
                          name={[name, 'columnName']}
                          // label={showLabel ? '列' : ''}
                          fieldKey={[fieldKey, 'columnName']}
                        >
                          <Select
                            placeholder={
                              formatMessage({
                                id: 'odc.PermissionApplication.CreateModal.PleaseSelect',
                              }) //请选择
                            }
                            style={{ width: '153px' }}
                          />
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
                    {formatMessage({ id: 'odc.PermissionApplication.CreateModal.Add' }) /*添加*/}
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            name={'expireTime'}
            label={
              formatMessage({ id: 'odc.PermissionApplication.CreateModal.SelectValidityPeriod' }) //选择有效期
            }
            required
          >
            <Radio.Group
              options={[
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.Days' }), //7天
                  value: '7d',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.Days.1' }), //30天
                  value: '30d',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.HalfAYear' }), //半年
                  value: 'hy',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.OneYear' }), //一年
                  value: '1y',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.ThreeYears' }), //三年
                  value: '3y',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.Custom' }), //自定义
                  value: 'custom',
                },
              ]}
            ></Radio.Group>
            <InputNumber />
          </Form.Item>
          <Form.Item
            name={'range'}
            required
            label={formatMessage({
              id: 'odc.PermissionApplication.CreateModal.SelectAnEffectiveRange',
            })} /*选择生效范围*/
          >
            <Checkbox.Group
              options={[
                {
                  label: formatMessage({
                    id: 'odc.PermissionApplication.CreateModal.SqlWindowQuery',
                  }), //SQL 窗口查询
                  value: 'sql-window',
                },
                {
                  label: formatMessage({ id: 'odc.PermissionApplication.CreateModal.Export' }), //导出
                  value: 'export',
                },
                {
                  label: formatMessage({
                    id: 'odc.PermissionApplication.CreateModal.DatabaseChanges',
                  }), //数据库变更
                  value: 'databaseChange',
                },
              ]}
            ></Checkbox.Group>
          </Form.Item>
          <Form.Item
            name={'tip'}
            label={
              formatMessage({ id: 'odc.PermissionApplication.CreateModal.Remarks' }) //备注
            }
          >
            <Input.TextArea
              placeholder={formatMessage({
                id: 'odc.PermissionApplication.CreateModal.PleaseEnter',
              })}
              /*请输入*/ rows={3}
            />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }),
);

export default CreateModal;
