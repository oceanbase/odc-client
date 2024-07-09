import { formatMessage } from '@/util/intl';
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

import { addTablePermissions } from '@/common/network/project';
import {
  expireTimeOptions,
  getExpireTime,
  permissionOptions,
} from '@/component/Task/ApplyTablePermission/CreateModal';
import TableSelecter, {
  groupTableByDataBase,
  groupTableIdsByDataBase,
} from '@/component/Task/component/TableSelecter';
import { Button, Checkbox, DatePicker, Drawer, Form, Modal, Select, Space, message } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;

interface IProps {
  projectId: number;
  userId: number;
  onSwitchUserTab: () => void;
}
const CreateModal: React.FC<IProps> = (props) => {
  const { projectId, userId, onSwitchUserTab } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [hasEdit, setHasEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleFieldsChange = () => {
    setHasEdit(true);
  };

  const hadleReset = () => {
    form.resetFields(null);
    setHasEdit(false);
  };

  const handleModalVisizble = (visible: boolean = true) => {
    setVisible(visible);
  };

  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'src.page.Project.User.ManageModal.Table.CreateAuth.994F4BA8',
          defaultMessage: '确认取消新增授权吗？',
        }),
        centered: true,
        onOk: () => {
          handleModalVisizble(false);
          hadleReset();
        },
      });
    } else {
      handleModalVisizble(false);
      hadleReset();
    }
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { tables, types, expireTime, customExpireTime } = values;
        const isCustomExpireTime = expireTime?.startsWith('custom');
        const data = {
          projectId,
          tableIds: groupTableIdsByDataBase(tables),
          types,
          expireTime: getExpireTime(expireTime, customExpireTime, isCustomExpireTime),
          userId,
        };
        setConfirmLoading(true);
        const res = await addTablePermissions(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.CreateAuth.B6C313E1',
              defaultMessage: '新增授权成功！',
            }),
          );
          onSwitchUserTab();
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  return (
    <>
      <Button
        onClick={() => {
          handleModalVisizble();
        }}
        type="primary"
      >
        {formatMessage({
          id: 'src.page.Project.User.ManageModal.Table.CreateAuth.69B76107',
          defaultMessage: '新增表授权',
        })}
      </Button>
      <Drawer
        destroyOnClose
        className={styles.createModal}
        width={816}
        title={formatMessage({
          id: 'src.page.Project.User.ManageModal.Table.CreateAuth.680C9CFF',
          defaultMessage: '新增授权',
        })}
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCancel(hasEdit);
              }}
            >
              {formatMessage({
                id: 'src.page.Project.User.ManageModal.Table.CreateAuth.9F6C8075',
                defaultMessage: '取消',
              })}
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {formatMessage({
                id: 'src.page.Project.User.ManageModal.Table.CreateAuth.35C819CB',
                defaultMessage: '新建',
              })}
            </Button>
          </Space>
        }
        open={visible}
        onClose={() => {
          handleCancel(hasEdit);
        }}
      >
        <Form
          name="basic"
          initialValues={null}
          layout="vertical"
          requiredMark="optional"
          form={form}
          onFieldsChange={handleFieldsChange}
        >
          <Form.Item
            name="tables"
            label={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.CreateAuth.0635BFD4',
              defaultMessage: '数据库',
            })}
            required
          >
            <TableSelecter projectId={projectId} />
          </Form.Item>
          <Form.Item
            name="types"
            label={formatMessage({
              id: 'src.page.Project.User.ManageModal.Table.CreateAuth.5FD0D70D',
              defaultMessage: '权限类型',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.page.Project.User.ManageModal.Table.CreateAuth.F34065CE',
                  defaultMessage: '请选择',
                }),
              },
            ]}
          >
            <CheckboxGroup options={permissionOptions} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={60}>
            <Form.Item
              label={formatMessage({
                id: 'src.page.Project.User.ManageModal.Table.CreateAuth.9C0612BE',
                defaultMessage: '权限有效期',
              })}
              name="expireTime"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.page.Project.User.ManageModal.Table.CreateAuth.705DD31B',
                    defaultMessage: '请选择',
                  }),
                },
              ]}
            >
              <Select
                style={{ width: '327px' }}
                showSearch
                placeholder={formatMessage({
                  id: 'src.page.Project.User.ManageModal.Table.CreateAuth.1D45C292',
                  defaultMessage: '请选择',
                })}
                options={expireTimeOptions}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const isCustomExpireTime = getFieldValue('expireTime')?.startsWith('custom');
                return (
                  isCustomExpireTime && (
                    <Form.Item
                      label={formatMessage({
                        id: 'src.page.Project.User.ManageModal.Table.CreateAuth.6D949D9E',
                        defaultMessage: '结束日期',
                      })}
                      name="customExpireTime"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.page.Project.User.ManageModal.Table.CreateAuth.E589EDA6',
                            defaultMessage: '请选择',
                          }),
                        },
                      ]}
                    >
                      <DatePicker style={{ width: '327px' }} />
                    </Form.Item>
                  )
                );
              }}
            </Form.Item>
          </Space>
        </Form>
      </Drawer>
    </>
  );
};
export default CreateModal;
