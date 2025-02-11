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

import {
  createTaskFlow,
  getTaskFlowDetail,
  getTaskFlowExists,
  updateTaskFlow,
} from '@/common/network/manager';
import HelpDoc from '@/component/helpDoc';
import { IManagerIntegration, IManagerRole } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { hourToSeconds, secondsToHour } from '@/util/utils';
import { validTrimEmptyWithWarn } from '@/util/valid';
import { Button, Drawer, Form, Input, InputNumber, message, Modal, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import React, { useEffect, useState } from 'react';
import { AuthNode } from '../AuthNode';
import styles from './index.less';

interface IProps {
  visible: boolean;
  editId: number;
  roles: IManagerRole[];
  integrations: IManagerIntegration[];
  onClose: () => void;
  reloadData: () => void;
}

const FormModal: React.FC<IProps> = (props) => {
  const [hasChange, setHasChange] = useState(false);
  const [builtIn, setBuiltIn] = useState(false);
  const [originName, setOriginName] = useState('');
  const [form] = useForm();
  const { visible, editId, roles, integrations } = props;
  const isEdit = !!editId;
  const submitText = isEdit
    ? formatMessage({ id: 'odc.component.FormModal.Save', defaultMessage: '保存' }) //保存
    : formatMessage({ id: 'odc.component.FormModal.Create', defaultMessage: '新建' }); //新建
  useEffect(() => {
    if (editId) {
      if (visible) {
        loadEditData(editId);
      }
    } else {
      setBuiltIn(false);
    }
  }, [editId, visible]);

  async function loadEditData(_editId: number) {
    const data = await getTaskFlowDetail(_editId);
    const {
      approvalExpirationIntervalSeconds,
      waitExecutionExpirationIntervalSeconds,
      executionExpirationIntervalSeconds,
    } = data;
    const formData = {
      ...data,
      approvalExpirationIntervalSeconds: secondsToHour(approvalExpirationIntervalSeconds),
      waitExecutionExpirationIntervalSeconds: secondsToHour(waitExecutionExpirationIntervalSeconds),
      executionExpirationIntervalSeconds: secondsToHour(executionExpirationIntervalSeconds),
    };
    form.setFieldsValue(formData);
    setBuiltIn(formData.builtIn);
    setOriginName(formData.name);
  }

  async function handleSubmit() {
    const configValues = await form.validateFields().catch();
    const {
      approvalExpirationIntervalSeconds,
      waitExecutionExpirationIntervalSeconds,
      executionExpirationIntervalSeconds,
    } = configValues;
    const formData = {
      ...configValues,
      approvalExpirationIntervalSeconds: hourToSeconds(approvalExpirationIntervalSeconds),
      waitExecutionExpirationIntervalSeconds: hourToSeconds(waitExecutionExpirationIntervalSeconds),
      executionExpirationIntervalSeconds: hourToSeconds(executionExpirationIntervalSeconds),
    };

    if (editId) {
      handleEdit({ ...formData, id: editId });
    } else {
      handleCreate(formData);
    }
  }

  async function handleCreate(values: any) {
    const data = await createTaskFlow(values);
    if (data) {
      message.success(
        formatMessage({
          id: 'odc.component.FormModal.ProcessCreatedSuccessfully',
          defaultMessage: '流程创建成功',
        }), //流程创建成功
      );
      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.component.FormModal.ProcessCreationFailed',
          defaultMessage: '流程创建失败',
        }), //流程创建失败
      );
    }
  }

  async function handleEdit(values) {
    const data = await updateTaskFlow(values);
    if (data) {
      message.success(
        formatMessage({
          id: 'odc.component.FormModal.ProcessSavedSuccessfully',
          defaultMessage: '流程保存成功',
        }), //流程保存成功
      );
      props.reloadData();
      props.onClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.component.FormModal.ProcessSaveFailed',
          defaultMessage: '流程保存失败',
        }), //流程保存失败
      );
    }
  }

  function handleCancel(_isEdit: boolean) {
    if (hasChange) {
      Modal.confirm({
        title: _isEdit
          ? formatMessage({
              id: 'odc.component.FormModal.AreYouSureYouWant',
              defaultMessage: '是否确定取消编辑？取消保存后，所编辑的内容将不生效',
            }) //确定要取消编辑吗？取消保存后，所编辑的内容将不生效
          : formatMessage({
              id: 'odc.component.FormModal.AreYouSureYouWant.1',
              defaultMessage: '确定要取消新建吗?',
            }), //确定要取消新建吗?
        cancelText: formatMessage({ id: 'odc.component.FormModal.Cancel', defaultMessage: '取消' }), //取消
        okText: formatMessage({ id: 'odc.component.FormModal.Ok', defaultMessage: '确定' }), //确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  }

  function handleClose() {
    form?.resetFields();
    props.onClose();
  }

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && originName === name)) {
      return;
    }
    const isRepeat = await getTaskFlowExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  return (
    <Drawer
      width={520}
      title={
        isEdit
          ? formatMessage({
              id: 'odc.component.FormModal.EditApprovalProcess',
              defaultMessage: '编辑审批流程',
            }) //编辑审批流程
          : formatMessage({
              id: 'odc.component.FormModal.CreateAnApprovalProcess',
              defaultMessage: '新建审批流程',
            }) //新建审批流程
      }
      className={styles.taskModal}
      footer={
        <Space>
          <Button
            onClick={() => {
              handleCancel(isEdit);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.FormModal.Cancel',
                defaultMessage: '取消',
              }) /*取消*/
            }
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {submitText}
          </Button>
        </Space>
      }
      destroyOnClose
      open={visible}
      onClose={() => {
        handleCancel(isEdit);
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={
          !isEdit
            ? {
                nodes: [
                  {
                    autoApproval: false,
                    externalApproval: false,
                  },
                ],

                approvalExpirationIntervalSeconds: 24,
                waitExecutionExpirationIntervalSeconds: 24,
                executionExpirationIntervalSeconds: 24,
              }
            : null
        }
      >
        <Form.Item
          label={formatMessage({
            id: 'odc.component.FormModal.ProcessName',
            defaultMessage: '流程名称',
          })} /*流程名称*/
          name="name"
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.FormModal.EnterAProcessName',
                defaultMessage: '请输入流程名称',
              }), //请输入流程名称
            },
            {
              max: 128,
              message: formatMessage({
                id: 'odc.component.FormModal.TheProcessNameCannotExceed',
                defaultMessage: '流程名称不超过 128 个字符',
              }), //流程名称不超过 128 个字符
            },
            {
              validator: validTrimEmptyWithWarn(
                formatMessage({
                  id: 'odc.component.FormModal.TheProcessNameContainsSpaces',
                  defaultMessage: '流程名称首尾包含空格',
                }), //流程名称首尾包含空格
              ),
            },
            {
              message: formatMessage({
                id: 'odc.component.FormModal.TheProcessNameAlreadyExists',
                defaultMessage: '流程名称已存在',
              }), //流程名称已存在
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'odc.component.FormModal.EnterATaskFlowName',
              defaultMessage: '请输入任务流程名称',
            })} /*请输入任务流程名称*/
          />
        </Form.Item>
        <Form.Item
          className={styles.taskProcess}
          label={formatMessage({
            id: 'odc.component.FormModal.SetApprovalNode',
            defaultMessage: '设置审批节点',
          })}
          /*设置审批节点*/ required
        >
          <AuthNode roles={roles} integrations={integrations} />
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: 'odc.component.FormModal.ProcessValidityPeriod',
            defaultMessage: '流程有效期',
          })}
          /*流程有效期*/ required
        >
          <Space size={40} className={styles.infoBlock}>
            <Form.Item
              required
              label={
                <HelpDoc leftText isTip doc="approvalExpiration">
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.ValidityPeriodOfApproval',
                      defaultMessage: '审批有效期',
                    }) /*审批有效期*/
                  }
                </HelpDoc>
              }
            >
              <Space>
                <Form.Item
                  name="approvalExpirationIntervalSeconds"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.component.FormModal.PleaseEnter',
                        defaultMessage: '请输入',
                      }), //请输入
                    },
                  ]}
                >
                  <InputNumber max={240} min={0} precision={1} />
                </Form.Item>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.Hours',
                      defaultMessage: '小时',
                    }) /*小时*/
                  }
                </span>
              </Space>
            </Form.Item>
            <Form.Item
              required
              label={
                <HelpDoc leftText isTip doc="waitExecutionExpiration">
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.ExecutionWaitingPeriod',
                      defaultMessage: '执行等待有效期',
                    }) /*执行等待有效期*/
                  }
                </HelpDoc>
              }
            >
              <Space>
                <Form.Item name="waitExecutionExpirationIntervalSeconds">
                  <InputNumber max={240} min={0} precision={1} />
                </Form.Item>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.Hours',
                      defaultMessage: '小时',
                    }) /*小时*/
                  }
                </span>
              </Space>
            </Form.Item>
            <Form.Item
              required
              label={
                <HelpDoc leftText isTip doc="executionExpiration">
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.ExecutionValidityPeriod',
                      defaultMessage: '执行有效期',
                    }) /*执行有效期*/
                  }
                </HelpDoc>
              }
            >
              <Space>
                <Form.Item
                  name="executionExpirationIntervalSeconds"
                  rules={[
                    {
                      required: true,
                      message: formatMessage({
                        id: 'odc.component.FormModal.PleaseEnter',
                        defaultMessage: '请输入',
                      }), //请输入
                    },
                  ]}
                >
                  <InputNumber max={240} min={0} precision={1} />
                </Form.Item>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.FormModal.Hours',
                      defaultMessage: '小时',
                    }) /*小时*/
                  }
                </span>
              </Space>
            </Form.Item>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FormModal;
