/*
 * Copyright 2024 OceanBase
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

import { getRoleExists, getUserList } from '@/common/network/manager';
import DisplayTable from '@/component/DisplayTable';
import Status from '@/component/Manage/Status';
import type { IManagerRole, IManagerUser } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import type { RadioChangeEvent } from 'antd';
import { Button, Form, Input, Radio, Select, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useContext, useEffect, useState } from 'react';
import { ResourceContext } from '../../../context';
import ResourceSelector from '../ResourceSelector';

import styles from './index.less';

const { Option } = Select;

const getColumns = (users: IManagerUser[], handleUserDelete: (id: number) => void) => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.FormRoleModal.component.Name',
      }),
      // 姓名
      ellipsis: true,
      width: 120,
      filters: users?.map(({ name, id }) => {
        return {
          text: name,
          value: id,
        };
      }),
      onFilter: (value, record) => value === record.id,
    },

    {
      dataIndex: 'accountName',
      title: formatMessage({
        id: 'odc.components.FormRoleModal.component.Account',
      }),
      // 账号
      ellipsis: true,
    },

    {
      dataIndex: 'enabled',
      title: formatMessage({
        id: 'odc.components.FormRoleModal.component.State',
      }),
      // 状态
      ellipsis: true,
      width: 115,
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.FormRoleModal.component.Enable',
          }),
          // 启用
          value: true,
        },

        {
          text: formatMessage({
            id: 'odc.components.FormRoleModal.component.Disable',
          }),
          // 停用
          value: false,
        },
      ],

      onFilter: (value, record) => value === record.enabled,
      render: (enabled) => {
        return <Status enabled={enabled} showIcon={false} />;
      },
    },

    {
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.components.FormRoleModal.component.Operation',
      }),
      // 操作
      ellipsis: true,
      width: 80,
      render: (value, record) => {
        return (
          <Button
            type="link"
            onClick={() => {
              handleUserDelete(record.id);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.component.Remove',
              })
              /* 移除 */
            }
          </Button>
        );
      },
    },
  ];
};

export const RoleResource: React.FC<{
  editId: number;
  isInternal: boolean;
  isHide: boolean;
  handleUsersChange: (label: string, value: any) => void;
}> = ({ editId, isInternal, isHide, handleUsersChange }) => {
  const { users } = useContext(ResourceContext);
  const [currentUser, setCurrentUser] = useState([]);
  const [deletedUser, setDeletedUser] = useState([]);
  const [userOptions, setUserOptions] = useState(users);

  useEffect(() => {
    (async () => {
      const data = await getUserList({
        roleId: [editId],
      });

      setCurrentUser(data?.contents);
    })();
  }, [editId]);

  useEffect(() => {
    const options = users?.filter((user) => {
      return !currentUser?.some((item) => item.id === user?.id);
    });
    setUserOptions(options);
  }, [users, currentUser]);

  const handleUserAdd = (values: number[]) => {
    handleUsersChange('add', values);
  };

  const handleUserDelete = (value: number) => {
    setDeletedUser([...deletedUser, value]);
    handleUsersChange('delete', [...deletedUser, value]);
  };

  const handleFilter = () => {
    return currentUser?.filter((user) => {
      return !deletedUser.includes(user.id);
    });
  };

  return (
    <Space size={8} direction="vertical" style={{ display: `${isHide ? 'none' : 'block'}` }}>
      <DisplayTable
        rowKey="id"
        columns={getColumns(currentUser, handleUserDelete)}
        dataSource={handleFilter()}
        disablePagination
        scroll={null}
      />

      <Space size={8} direction="vertical" style={{ width: '100%' }}>
        <div className={styles.title}>
          {
            formatMessage({
              id: 'odc.components.FormRoleModal.component.AddUser',
            })
            /* 添加用户 */
          }
        </div>
        <Select
          disabled={isInternal}
          mode="multiple"
          placeholder={formatMessage({
            id: 'odc.components.FormRoleModal.component.SelectAUser',
          })}
          /* 请选择用户 */
          style={{ width: '100%' }}
          allowClear
          onChange={handleUserAdd}
          showSearch={true}
          filterOption={(value, option) => {
            return option?.props?.children?.indexOf(value) >= 0;
          }}
        >
          {userOptions?.map((item) => {
            return (
              <Option key={item.id} value={item.id}>
                {`${item.name} ${item.accountName}`}
              </Option>
            );
          })}
        </Select>
      </Space>
    </Space>
  );
};

export const FormContent: React.FC<{
  initialValue: any;
  isEdit: boolean;
  isCopy: boolean;
  isHide: boolean;
  permissionActiveKey: string;
  formRef: React.RefObject<FormInstance>;
  handleEditStatus: () => void;
  handleFieldChange: (label: string, value: any) => void;
  handleStatusChange: (status: boolean, role: IManagerRole, callback: () => void) => void;
  handlePermissionTypeChange: (key: string) => void;
}> = (props) => {
  const {
    initialValue,
    isEdit,
    isCopy,
    isHide,
    permissionActiveKey,
    formRef,
    handleEditStatus,
    handleFieldChange,
    handlePermissionTypeChange,
  } = props;

  const handleStatusChange = (e: RadioChangeEvent) => {
    if (!e.target.value && isEdit) {
      props.handleStatusChange(e.target.value, null, () => {
        handleFieldChange('enabled', true);
      });
    }
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && initialValue?.name === name)) {
      return;
    }
    const isRepeat = await getRoleExists(value);
    if (isRepeat) {
      throw new Error();
    }
  };

  return (
    <Form
      ref={formRef}
      layout="vertical"
      requiredMark="optional"
      initialValues={initialValue}
      onFieldsChange={handleEditStatus}
      style={{ display: `${isHide ? 'none' : 'block'}` }}
    >
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormRoleModal.component.RoleName',
        })}
        /* 角色名称 */
        name="name"
        validateTrigger="onBlur"
        style={{ width: '320px' }}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.EnterARoleName',
            }),
            // 请输入角色名称
          },
          {
            max: 64,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.TheRoleNameCannotExceed.1',
            }), //角色名称不超过 64 个字符
          },
          {
            validator: validTrimEmptyWithWarn(
              formatMessage({
                id: 'odc.components.FormRoleModal.component.TheRoleNameContainsSpaces',
              }), //角色名称首尾包含空格
            ),
          },
          {
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.TheRoleNameAlreadyExists',
            }), // 角色名称已存在
            validator: checkNameRepeat,
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormRoleModal.component.RoleStatus',
        })}
        /* 角色状态 */
        name="enabled"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.SelectAStatus',
            }),
            // 请选择状态
          },
        ]}
      >
        <Radio.Group onChange={handleStatusChange}>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.component.Enable',
              })
              /* 启用 */
            }
          </Radio>
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.component.Disable',
              })
              /* 停用 */
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <ResourceSelector
        initialValue={initialValue}
        isEdit={isEdit}
        isCopy={isCopy}
        permissionActiveKey={permissionActiveKey}
        formRef={formRef}
        handleFieldChange={handleFieldChange}
        handlePermissionTypeChange={handlePermissionTypeChange}
      />

      <Form.Item
        label={formatMessage({
          id: 'odc.components.FormRoleModal.component.Note',
        })}
        /* 备注 */
        name="description"
        rules={[
          {
            max: 140,
            message: formatMessage({
              id: 'odc.components.FormRoleModal.component.TheDescriptionCannotExceedCharacters',
            }),
            // 备注不超过 140 个字符
          },
        ]}
      >
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
      </Form.Item>
    </Form>
  );
};
