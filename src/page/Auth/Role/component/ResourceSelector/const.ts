import { IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

// 链接访问权限
export const connectionAccessTypeOptions = [
  {
    label: '数据源',
    value: IManagerResourceType.public_connection,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ResourceGroup',
    }), //资源组
    value: IManagerResourceType.resource_group,
  },
];

export enum ConnectionAccessAction {
  readonlyconnect = 'readonlyconnect',
  connect = 'connect',
  apply = 'apply',
}

export const connectionAccessActionMap = {
  [ConnectionAccessAction.readonlyconnect]: ['readonlyconnect'],
  [ConnectionAccessAction.connect]: ['connect'],
  [ConnectionAccessAction.apply]: ['apply'],
};

export const connectionAccessActionOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ReadOnly',
    }), //只读
    value: ConnectionAccessAction.readonlyconnect,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ReadWrite',
    }), //读写
    value: ConnectionAccessAction.connect,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.CanApply',
    }), //可申请
    value: ConnectionAccessAction.apply,
  },
];

// 资源管理权限
export const resourceManagementTypeOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.PublicConnection',
    }), //公共连接
    value: IManagerResourceType.public_connection,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ResourceGroup',
    }), //资源组
    value: IManagerResourceType.resource_group,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Role',
    }), //角色
    value: IManagerResourceType.role,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.User',
    }), //用户
    value: IManagerResourceType.user,
  },
];

export enum ResourceManagementAction {
  can_manage = 'can_manage',
  can_update = 'can_update',
  can_read = 'can_read',
}

export const resourceManagementActionMap = {
  [ResourceManagementAction.can_manage]: ['delete', 'read', 'update'],
  [ResourceManagementAction.can_update]: ['read', 'update'],
  [ResourceManagementAction.can_read]: ['read'],
};

export const resourceManagementActionOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Manageable',
    }), //可管理
    value: ResourceManagementAction.can_manage,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Editable',
    }), //可编辑
    value: ResourceManagementAction.can_update,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ViewOnly',
    }), //仅查看
    value: ResourceManagementAction.can_read,
  },
];

// 系统操作权限
export const systemTypeOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.PersonalConnection',
    }), //个人连接
    value: IManagerResourceType.private_connection,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.TaskFlow',
    }), //任务流程
    value: IManagerResourceType.flow_config,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.DesensitizationRules',
    }), //脱敏规则
    value: IManagerResourceType.odc_data_masking_rule,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.OperationRecord',
    }), //操作记录
    value: IManagerResourceType.odc_audit_event,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.SystemConfiguration',
    }), //系统配置
    value: IManagerResourceType.system_config,
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.AutomaticAuthorization',
    }), //自动授权
    value: IManagerResourceType.auto_auth,
    visible: false,
  },
];

export enum SystemAction {
  private_connection_operation = 'private_connection_operation',
  system_config_operation = 'system_config_operation',
  common_operation = 'common_operation',
  common_read = 'common_read',
}

export const systemActionMap = {
  [SystemAction.private_connection_operation]: ['create', 'delete', 'read', 'update', 'use'],
  [SystemAction.system_config_operation]: ['read', 'update'],
  [SystemAction.common_operation]: ['create', 'delete', 'read', 'update'],
  [SystemAction.common_read]: ['read'],
};

export const systemActionOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.private_connection_operation,
    enableKeys: [IManagerResourceType.private_connection],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.system_config_operation,
    enableKeys: [IManagerResourceType.system_config],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.common_operation,
    enableKeys: [
      IManagerResourceType.flow_config,
      IManagerResourceType.odc_data_masking_rule,
      IManagerResourceType.auto_auth,
    ],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ViewOnly',
    }), //仅查看
    value: SystemAction.common_read,
    enableKeys: [
      IManagerResourceType.flow_config,
      IManagerResourceType.odc_data_masking_rule,
      IManagerResourceType.odc_audit_event,
      IManagerResourceType.system_config,
      IManagerResourceType.auto_auth,
    ],
  },
];

export const permissionMap = {
  [IManagerRolePermissionType.connectionAccessPermissions]: {
    typeOptions: connectionAccessTypeOptions,
    actionOptions: connectionAccessActionOptions,
  },

  [IManagerRolePermissionType.resourceManagementPermissions]: {
    typeOptions: resourceManagementTypeOptions,
    actionOptions: resourceManagementActionOptions,
  },

  [IManagerRolePermissionType.systemOperationPermissions]: {
    typeOptions: systemTypeOptions,
    actionOptions: systemActionOptions,
  },
};
