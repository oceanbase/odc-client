import { createRole, getRoleDetail, updateRole } from '@/common/network/manager';
import { EnableRoleSystemPermission } from '@/constant';
import type { IManagerRole } from '@/d.ts';
import { IManagerDetailTabs, IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Radio, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { isNull, set } from 'lodash';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ManageContext } from '../../context';
import {
  connectionAccessActionMap,
  resourceManagementActionMap,
  SystemAction,
  systemActionMap,
} from '../FormResourceSelector/const';
import resourceActions from '../FormResourceSelector/resourceActions';
import { ALL_SELECTED_ID, isSelectedAll } from '../ResourceSelector2';
import { FormContent, RoleResource } from './component';
import styles from './index.less';

interface IProps {
  visible: boolean;
  editId?: number;
  copyId?: number;
  onClose: () => void;
  handleStatusChange?: (status: boolean, role: IManagerRole, callback: () => void) => void;
}

interface IManagerRoleFormData {
  name: string;
  enabled: boolean;
  description: string;
  createAbleResource: string[];
  permissionType: string[];
  systemOperationPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string;
  }[];
  connectionAccessPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string;
  }[];
  resourceManagementPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string;
  }[];
}

const defaultData = {
  enabled: true,
  connectionAccessPermissions: [
    {
      actions: 'connect',
      resourceId: undefined,
      resourceType: 'ODC_CONNECTION',
    },
  ],
  resourceManagementPermissions: [null],
  systemOperationPermissions: [
    {
      resourceType: IManagerResourceType.private_connection,
      actions: SystemAction.private_connection_operation,
    },
    {
      resourceType: IManagerResourceType.flow_config,
      actions: SystemAction.common_read,
    },
    {
      resourceType: IManagerResourceType.odc_data_masking_rule,
      actions: SystemAction.common_operation,
    },
    {
      resourceType: IManagerResourceType.odc_audit_event,
      actions: SystemAction.common_read,
    },
    {
      resourceType: IManagerResourceType.system_config,
      actions: SystemAction.common_read,
    },
  ],
  createAbleResource: [
    IManagerResourceType.public_connection,
    IManagerResourceType.resource_group,
    IManagerResourceType.role,
    IManagerResourceType.user,
  ],
  permissionType: [
    IManagerRolePermissionType.connectionAccessPermissions,
    IManagerRolePermissionType.resourceManagementPermissions,
    IManagerRolePermissionType.systemOperationPermissions,
  ],
};

interface IRoleForUpdate extends IManagerRole {
  bindUserIds: number[];
  unbindUserIds: number[];
}

const FormRoleModal: React.FC<IProps> = (props) => {
  const { visible, editId, copyId, onClose, handleStatusChange } = props;
  const isCopy = !!copyId;
  const isEdit = !!editId && !isCopy;
  const [hasChange, setHasChange] = useState(false);
  const [activeKey, setActiveKey] = useState(IManagerDetailTabs.DETAIL);
  const [permissionActiveKey, setPermissionActiveKey] = useState('connectionAccessPermissions');
  const [data, setData] = useState(isEdit || isCopy ? null : defaultData);
  const [users, setUsers] = useState(null);
  const [isInternal, setInternal] = useState(false);
  const formRef = useRef<FormInstance>();
  const { updateRoleById, getRoleList, getUserList } = useContext(ManageContext);

  const handleUnifyDataForDetail = (
    values: {
      resourceType: string;
      resourceId: string;
      actions: string[];
    }[],
    permissionType: IManagerRolePermissionType,
  ) => {
    return values?.map(({ actions, resourceId, ...rest }) => ({
      ...rest,
      resourceId: isNull(resourceId) ? ALL_SELECTED_ID : resourceId,
      actions: resourceActions.getActionStringValue(actions, permissionType),
    }));
  };

  const loadDetailData = async (id: number) => {
    const detail = await getRoleDetail(id);
    const {
      description,
      enabled,
      name,
      systemOperationPermissions,
      connectionAccessPermissions,
      resourceManagementPermissions,
    } = detail ?? {};
    const formData: IManagerRoleFormData = {
      description,
      enabled,
      name: isCopy
        ? formatMessage(
            {
              id: 'odc.components.FormRoleModal.NameCopy',
            },
            { name },
          ) // `${name}_复制`
        : name?.trim(),
      createAbleResource: [],
      permissionType: [],
      connectionAccessPermissions: [],
      systemOperationPermissions: [],
      resourceManagementPermissions: [],
    };

    if (connectionAccessPermissions?.length) {
      formData.permissionType.push('connectionAccessPermissions');
      formData.connectionAccessPermissions = handleUnifyDataForDetail(
        connectionAccessPermissions,
        IManagerRolePermissionType.connectionAccessPermissions,
      );
    }
    if (systemOperationPermissions?.length) {
      formData.permissionType.push('systemOperationPermissions');
      formData.systemOperationPermissions = handleUnifyDataForDetail(
        systemOperationPermissions,
        IManagerRolePermissionType.systemOperationPermissions,
      );
    }
    if (resourceManagementPermissions?.length) {
      const createAbleResource = [];
      const _resourceManagementPermissions = [];
      formData.permissionType.push('resourceManagementPermissions');
      resourceManagementPermissions?.forEach(({ actions, resourceId, resourceType }) => {
        if (actions.includes('create')) {
          createAbleResource.push(resourceType);
        } else {
          _resourceManagementPermissions.push({
            resourceId,
            resourceType,
            actions,
          });
        }
      });
      formData.createAbleResource = createAbleResource;
      formData.resourceManagementPermissions = handleUnifyDataForDetail(
        _resourceManagementPermissions,
        IManagerRolePermissionType.resourceManagementPermissions,
      );
    }
    setPermissionActiveKey(formData.permissionType[0]);
    setData(formData as any);
    setInternal(detail.type === 'INTERNAL');
    formRef.current.setFieldsValue(formData);
  };

  const handleCloseModal = () => {
    onClose();
    formRef.current?.resetFields();
    setActiveKey(IManagerDetailTabs.DETAIL);
    setUsers(null);
    setData(null);
  };

  useEffect(() => {
    if (editId) {
      loadDetailData(editId);
      getUserList();
    } else {
      if (visible) {
        setPermissionActiveKey('connectionAccessPermissions');
        setData(defaultData);
        formRef.current.setFieldsValue(defaultData);
      }
    }
  }, [editId, visible]);

  const handleCreate = async (values: Partial<IManagerRole>) => {
    const res = await createRole(values);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.FormRoleModal.RoleCreated' }), // 角色创建成功
      );
      getRoleList();
      handleCloseModal();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormRoleModal.UnableToCreateTheRole',
        }),
        // 角色创建失败
      );
    }
  };

  const handleEdit = async (values: Partial<IRoleForUpdate>) => {
    const res = await updateRole(values);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.components.FormRoleModal.RoleSaved' }), // 角色保存成功
      );
      updateRoleById(res);
      handleCloseModal();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormRoleModal.UnableToSaveTheRole',
        }),
        // 角色保存失败
      );
    }
  };

  const handleUsersChange = (type: 'add' | 'delete', values: number[]) => {
    setUsers({
      ...users,
      [type]: values,
    });
  };

  const handleUnifyData = (
    data: {
      resourceType: string;
      resourceId?: number;
      actions?: string;
    }[],
    actionMap: any,
  ) => {
    const values = data?.filter((item) =>
      Object.values(item)?.every((item) => item || isNull(item)),
    );
    return values?.map(({ resourceId, actions, ...reset }) => {
      return {
        ...reset,
        resourceId: isSelectedAll(resourceId) ? null : resourceId,
        actions: actionMap?.[actions],
      };
    });
  };

  const handleSubmit = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        const {
          name,
          enabled,
          description,
          permissionType,
          createAbleResource,
          systemOperationPermissions,
          connectionAccessPermissions,
          resourceManagementPermissions,
        } = values;
        const formData = {
          name,
          enabled,
          description,
          connectionAccessPermissions: [],
          systemOperationPermissions: [],
          resourceManagementPermissions: [],
        };
        const filteredPermissionType = permissionType.filter((item) =>
          EnableRoleSystemPermission ? item : item !== 'systemOperationPermissions',
        );

        if (!EnableRoleSystemPermission) {
          formData.systemOperationPermissions = undefined;
        }
        if (!EnableRoleSystemPermission && !filteredPermissionType.length) {
          formRef.current.setFields([
            {
              name: 'permissionType',
              errors: [
                formatMessage({
                  id: 'odc.components.FormRoleModal.SelectAPermissionType',
                }), // 请选择权限类型
              ],
            },
          ]);

          throw new Error(null);
        }
        formData.connectionAccessPermissions = handleUnifyData(
          connectionAccessPermissions,
          connectionAccessActionMap,
        );
        formData.resourceManagementPermissions = handleUnifyData(
          resourceManagementPermissions,
          resourceManagementActionMap,
        );
        formData.systemOperationPermissions = handleUnifyData(
          systemOperationPermissions,
          systemActionMap,
        );
        if (createAbleResource?.length) {
          createAbleResource?.forEach((type) => {
            formData.resourceManagementPermissions?.push({
              resourceType: type,
              resourceId: null,
              actions: ['create'],
            });
          });
        }

        if (
          filteredPermissionType?.includes(
            IManagerRolePermissionType.resourceManagementPermissions,
          ) &&
          !formData.resourceManagementPermissions?.length
        ) {
          formRef.current.setFields([
            {
              name: 'createAbleResource',
              errors: [
                formatMessage({
                  id: 'odc.components.FormRoleModal.SelectANewObject',
                }), //请选择可新建的对象
              ],
            },
          ]);
          throw new Error(null);
        }
        if (isEdit) {
          handleEdit({
            ...formData,
            bindUserIds: users?.add,
            unbindUserIds: users?.delete,
            id: editId,
          });
        } else {
          handleCreate(formData);
        }
      })
      .catch((error) => {
        if (error?.errorFields?.some(({ name }) => name.includes('connectionAccessPermissions'))) {
          setPermissionActiveKey('connectionAccessPermissions');
        } else if (
          error?.errorFields?.some(({ name }) => name.includes('resourceManagementPermissions'))
        ) {
          setPermissionActiveKey('resourceManagementPermissions');
        } else if (
          EnableRoleSystemPermission &&
          error?.errorFields?.some(({ name }) => name.includes('systemOperationPermissions'))
        ) {
          setPermissionActiveKey('systemOperationPermissions');
        }
        console.error(JSON.stringify(error));
      });
  };

  const handleCancel = () => {
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormRoleModal.AreYouSureYouWant',
            })
          : // 确定要取消编辑吗？取消保存后，所编辑的内容将不生效
            formatMessage({
              id: 'odc.components.FormRoleModal.AreYouSureYouWant.1',
            }),
        // 确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormRoleModal.Cancel',
        }),
        // 取消
        okText: formatMessage({ id: 'odc.components.FormRoleModal.Determine' }), // 确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleCloseModal();
        },
      });
    } else {
      handleCloseModal();
    }
  };

  const resetValidateStatus = () => {
    formRef.current.setFields([
      {
        name: 'createAbleResource',
        errors: [],
      },
    ]);
  };

  const handleEditStatus = () => {
    setHasChange(true);
    resetValidateStatus();
  };

  const handleFieldChange = (label: string, value: any) => {
    const newData = set({ ...data }, label, value);
    if (label === 'permissionType') {
      if (!value.includes('connectionAccessPermissions')) {
        set(newData, 'connectionAccessPermissions', null);
        formRef.current.setFieldsValue({
          connectionAccessPermissions: [],
        });
      }
      if (!value.includes('systemOperationPermissions')) {
        set(newData, 'systemOperationPermissions', null);
        formRef.current.setFieldsValue({
          systemOperationPermissions: [],
        });
      }
    }

    formRef.current.setFieldsValue({
      [label]: value,
    });
    setData(newData);
  };

  const handleChangeKey = (e) => {
    setActiveKey(e.target.value);
  };

  const handlePermissionTypeChange = (key: string) => {
    setPermissionActiveKey(key);
  };
  return (
    <Drawer
      width={720}
      title={
        isEdit
          ? formatMessage({ id: 'odc.components.FormRoleModal.EditARole' }) // 编辑角色
          : formatMessage({ id: 'odc.components.FormRoleModal.CreateARole' }) // 新建角色
      }
      className={styles.userModal}
      footer={
        <Space>
          <Button onClick={handleCancel}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.Cancel',
              })
              /* 取消 */
            }
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {
              isEdit
                ? formatMessage({ id: 'odc.components.FormRoleModal.Save' }) // 保存
                : formatMessage({ id: 'odc.components.FormRoleModal.New' }) // 新建
            }
          </Button>
        </Space>
      }
      destroyOnClose
      visible={visible}
      onClose={handleCancel}
    >
      {isEdit && (
        <Radio.Group onChange={handleChangeKey} value={activeKey} style={{ marginBottom: '8px' }}>
          <Radio.Button value={IManagerDetailTabs.DETAIL}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.RoleDetails',
              })
              /* 角色详情 */
            }
          </Radio.Button>
          <Radio.Button value={IManagerDetailTabs.RESOURCE}>
            {
              formatMessage({
                id: 'odc.components.FormRoleModal.RelatedUsers',
              })
              /* 相关用户 */
            }
          </Radio.Button>
        </Radio.Group>
      )}

      <FormContent
        initialValue={data}
        isEdit={isEdit}
        isCopy={isCopy}
        isHide={activeKey !== IManagerDetailTabs.DETAIL}
        permissionActiveKey={permissionActiveKey}
        formRef={formRef}
        handleEditStatus={handleEditStatus}
        handleFieldChange={handleFieldChange}
        handleStatusChange={handleStatusChange}
        handlePermissionTypeChange={handlePermissionTypeChange}
      />

      {isEdit && (
        <RoleResource
          editId={editId}
          isInternal={isInternal}
          isHide={activeKey !== IManagerDetailTabs.RESOURCE}
          handleUsersChange={handleUsersChange}
        />
      )}
    </Drawer>
  );
};

export default FormRoleModal;
