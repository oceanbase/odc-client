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

import { addDatabasePermissions } from '@/common/network/project';
import { Button, Drawer, Form, Modal, Select, Space, message, DatePicker, Checkbox } from 'antd';
import React, { useState } from 'react';
import DatabaseSelecter from '@/component/Task/component/DatabaseSelecter';
import {
  permissionOptions,
  expireTimeOptions,
  getExpireTime,
} from '@/component/Task/ApplyDatabasePermission/CreateModal';
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
  const handleCancel = (hasEdit: boolean) => {
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({ id: 'src.page.Project.User.ManageModal.CreateAuth.8BBA1BE1' }), //'确认取消新增授权吗？'
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
        const { databases: databaseIds, types, expireTime, customExpireTime } = values;
        const isCustomExpireTime = expireTime?.startsWith('custom');
        const data = {
          projectId,
          databaseIds,
          types,
          expireTime: getExpireTime(expireTime, customExpireTime, isCustomExpireTime),
          userId,
        };
        setConfirmLoading(true);
        const res = await addDatabasePermissions(data);
        handleCancel(false);
        setConfirmLoading(false);
        if (res) {
          message.success(
            formatMessage({
              id: 'src.page.Project.User.ManageModal.CreateAuth.6770E480' /*'新增授权成功！'*/,
            }),
          );
          onSwitchUserTab();
        }
      })
      .catch((errorInfo) => {
        console.error(JSON.stringify(errorInfo));
      });
  };

  const handleModalVisizble = (visible: boolean = true) => {
    setVisible(visible);
  };

  return (
    <>
      <Button
        onClick={() => {
          handleModalVisizble();
        }}
        type="primary"
      >
        {
          formatMessage({
            id: 'src.page.Project.User.ManageModal.CreateAuth.67243BDA' /*新增授权*/,
          }) /* 新增授权 */
        }
      </Button>
      <Drawer
        destroyOnClose
        className={styles.createModal}
        width={816}
        title={
          formatMessage({
            id: 'src.page.Project.User.ManageModal.CreateAuth.6F4F2A2B',
          }) /*"新增授权"*/
        }
        footer={
          <Space>
            <Button
              onClick={() => {
                handleCancel(hasEdit);
              }}
            >
              {
                formatMessage({
                  id: 'src.page.Project.User.ManageModal.CreateAuth.779234F2' /*取消*/,
                }) /* 取消 */
              }
            </Button>
            <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'src.page.Project.User.ManageModal.CreateAuth.2829F833' /*新建*/,
                }) /* 新建 */
              }
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
            name="databases"
            label={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.CreateAuth.9D4B0281',
              }) /*"数据库"*/
            }
            required
          >
            <DatabaseSelecter projectId={projectId} />
          </Form.Item>
          <Form.Item
            name="types"
            label={
              formatMessage({
                id: 'src.page.Project.User.ManageModal.CreateAuth.A7E6BF77',
              }) /*"权限类型"*/
            }
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.page.Project.User.ManageModal.CreateAuth.C8194E4D',
                }), //'请选择'
              },
            ]}
          >
            <CheckboxGroup options={permissionOptions} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={60}>
            <Form.Item
              label={
                formatMessage({
                  id: 'src.page.Project.User.ManageModal.CreateAuth.71FFF9CD',
                }) /*"权限有效期"*/
              }
              name="expireTime"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.page.Project.User.ManageModal.CreateAuth.926CCBB2',
                  }), //'请选择'
                },
              ]}
            >
              <Select
                style={{ width: '327px' }}
                showSearch
                placeholder={
                  formatMessage({
                    id: 'src.page.Project.User.ManageModal.CreateAuth.DBAB617B',
                  }) /*"请选择"*/
                }
                options={expireTimeOptions}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const isCustomExpireTime = getFieldValue('expireTime')?.startsWith('custom');
                return (
                  isCustomExpireTime && (
                    <Form.Item
                      label={
                        formatMessage({
                          id: 'src.page.Project.User.ManageModal.CreateAuth.52A18A2F',
                        }) /*"结束日期"*/
                      }
                      name="customExpireTime"
                      rules={[
                        {
                          required: true,
                          message: formatMessage({
                            id: 'src.page.Project.User.ManageModal.CreateAuth.02B42ECB',
                          }), //'请选择'
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
