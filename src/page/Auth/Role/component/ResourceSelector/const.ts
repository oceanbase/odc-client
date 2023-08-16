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

import { IManagerResourceType, IManagerRolePermissionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { ResourceManagementAction } from '../../../utils';

// 链接访问权限
export const connectionAccessTypeOptions = [
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.DataSource',
    }),
    //数据源
    value: IManagerResourceType.project,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.Project',
    }),
    //项目
    value: IManagerResourceType.project,
  },
];
export enum ConnectionAccessAction {
  readonlyconnect = 'readonlyconnect',
  connect = 'connect',
  apply = 'apply',
}

// 资源管理权限
export const resourceManagementTypeOptions = [
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.DataSource',
    }),
    //数据源
    value: IManagerResourceType.resource,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.Project',
    }),
    //项目
    value: IManagerResourceType.project,
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Role',
    }),
    //角色
    value: IManagerResourceType.role,
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.User',
    }),
    //用户
    value: IManagerResourceType.user,
  },
];
export const resourceManagementActionOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Manageable',
    }),
    //可管理
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
    }),
    //可编辑
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
    }),
    //仅查看
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
    }),
    //操作记录
    value: IManagerResourceType.odc_audit_event,
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.AutomaticAuthorization',
    }),
    //自动授权
    value: IManagerResourceType.auto_auth,
    visible: false,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.ApprovalProcess',
    }),
    //审批流程
    value: IManagerResourceType.approval_flow,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.RiskLevel',
    }),
    //风险等级
    value: IManagerResourceType.risk_level,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.RiskIdentificationRules',
    }),
    //风险识别规则
    value: IManagerResourceType.risk_detect,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.DevelopmentSpecifications',
    }),
    //开发规范
    value: IManagerResourceType.ruleset,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.SystemIntegration',
    }),
    //系统集成
    value: IManagerResourceType.integration,
  },
  {
    label: formatMessage({
      id: 'odc.src.page.Auth.Role.component.ResourceSelector.PersonalSpace',
    }), //'个人空间'
    value: IManagerResourceType.individual_organization,
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
    }),
    //可操作
    value: SystemAction.action_update_read,
    enableKeys: [IManagerResourceType.individual_organization],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }),
    //可操作
    value: SystemAction.action_create_delete_update,
    enableKeys: [IManagerResourceType.approval_flow, IManagerResourceType.risk_detect],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }),
    //可操作
    value: SystemAction.action_update,
    enableKeys: [IManagerResourceType.ruleset, IManagerResourceType.risk_level],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Operational',
    }),
    //可操作
    value: SystemAction.action_create_delete_update_read,
    enableKeys: [IManagerResourceType.integration, IManagerResourceType.auto_auth],
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.ViewOnly',
    }),
    //仅查看
    value: SystemAction.action_read,
    enableKeys: [
      IManagerResourceType.odc_audit_event,
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
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.DataSource',
    }),
    //数据源
    value: IManagerResourceType.resource,
  },
  {
    label: formatMessage({
      id: 'odc.component.ResourceSelector.const.Project',
    }),
    //项目
    value: IManagerResourceType.project,
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.Role',
    }),
    //角色
    value: IManagerResourceType.role,
  },
  {
    label: formatMessage({
      id: 'odc.components.FormResourceSelector.const.User',
    }),
    //用户
    value: IManagerResourceType.user,
  },
];
