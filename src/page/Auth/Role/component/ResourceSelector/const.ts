import { IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

// 链接访问权限
export const connectionAccessTypeOptions = [
  {
    label: '数据源',
    value: IManagerResourceType.project,
  },

  {
    label: '项目',
    value: IManagerResourceType.project,
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
    label: '数据源',
    value: IManagerResourceType.resource,
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
    enableKeys: [
      IManagerResourceType.resource,
      IManagerResourceType.role,
      IManagerResourceType.user,
    ],
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Editable',
    }), //可编辑
    value: ResourceManagementAction.can_update,
    enableKeys: [
      IManagerResourceType.resource,
      IManagerResourceType.role,
      IManagerResourceType.user,
    ],
  },

  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ViewOnly',
    }), //仅查看
    value: ResourceManagementAction.can_read,
    enableKeys: [
      IManagerResourceType.resource,
      IManagerResourceType.role,
      IManagerResourceType.user,
    ],
  },
];

// 系统操作权限
export const systemTypeOptions: {
  label: string;
  value: IManagerResourceType;
  visible?: boolean;
}[] = [
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
  {
    label: '审批流程',
    value: IManagerResourceType.approval_flow,
  },
  {
    label: '风险等级',
    value: IManagerResourceType.risk_level,
  },
  {
    label: '风险识别规则',
    value: IManagerResourceType.risk_detect,
  },
  {
    label: '开发规范',
    value: IManagerResourceType.ruleset,
  },
  {
    label: '系统集成',
    value: IManagerResourceType.integration,
  },
];

export enum SystemAction {
  action_read = 'action_read',
  action_update = 'action_update',
  action_update_read = 'action_update_read',
  action_create_delete_update = 'action_create_delete_update',
  action_create_delete_update_read = 'action_create_delete_update_read',
}

export const systemActionMap = {
  [SystemAction.action_read]: ['read'],
  [SystemAction.action_update]: ['update'],
  [SystemAction.action_update_read]: ['read', 'update'],
  [SystemAction.action_create_delete_update]: ['create', 'delete', 'update'],
  [SystemAction.action_create_delete_update_read]: ['create', 'delete', 'update', 'read'],
};

export const systemActionOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.action_update_read,
    enableKeys: [IManagerResourceType.system_config],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.action_create_delete_update,
    enableKeys: [IManagerResourceType.approval_flow, IManagerResourceType.risk_detect],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.action_update,
    enableKeys: [IManagerResourceType.ruleset, IManagerResourceType.risk_level],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }), //可操作
    value: SystemAction.action_create_delete_update_read,
    enableKeys: [IManagerResourceType.integration, IManagerResourceType.auto_auth],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ViewOnly',
    }), //仅查看
    value: SystemAction.action_read,
    enableKeys: [
      IManagerResourceType.odc_audit_event,
      IManagerResourceType.system_config,
      IManagerResourceType.auto_auth,
      IManagerResourceType.integration,
    ],
  },
];

export const permissionMap = {
  [IManagerRolePermissionType.resourceManagementPermissions]: {
    typeOptions: resourceManagementTypeOptions,
    actionOptions: resourceManagementActionOptions,
  },

  [IManagerRolePermissionType.systemOperationPermissions]: {
    typeOptions: systemTypeOptions,
    actionOptions: systemActionOptions,
  },
};

// 可新建的资源管理权限
export const createAbleResourceOptions = [
  {
    label: '数据源',
    value: IManagerResourceType.resource,
  },

  {
    label: '项目',
    value: IManagerResourceType.project,
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
