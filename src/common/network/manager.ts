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

import type { ITaskFlow, IUser } from '@/d.ts';
import {
  AuditEventActionType,
  AuditEventResult,
  AuditEventType,
  EncryptionAlgorithm,
  IAudit,
  IAuditEvent,
  IAuditExport,
  IAutoAuthEvent,
  IAutoAuthRule,
  IManagerIntegration,
  IManagerPublicConnection,
  IManagerResourceGroup,
  IManagerRole,
  IManagerUser,
  IManagerUserPermission,
  IManageUserListParams,
  IMaskRule,
  IntegrationType,
  IPromptVo,
  IRequestListParamsV2,
  IResourceRole,
  IResponseData,
  ISSOConfig,
} from '@/d.ts';
import request from '@/util/request';
import { encrypt } from '@/util/utils';
interface IRoleForUpdate extends IManagerRole {
  bindUserIds: number[];
  unbindUserIds: number[];
}

/**
 * 新建用户
 */
export async function createUser(data: Partial<IManagerUser>[]): Promise<IManagerUser> {
  const result = await request.post('/api/v2/iam/users/batchCreate', {
    data: data?.map((item) => Object.assign({}, item, { password: encrypt(item.password) })),
  });
  return result?.data;
}

/**
 * 删除用户详情
 */
export async function deleteUser(id: number): Promise<IManagerUser> {
  const result = await request.delete(`/api/v2/iam/users/${id}`);
  return result?.data;
}

/**
 * 更新用户
 */
export async function updateUser(data: Partial<IManagerUser>): Promise<IManagerUser> {
  const result = await request.put(`/api/v2/iam/users/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 设置用户状态
 */
export async function setUserEnable(data: { id: number; enabled: boolean }): Promise<IManagerUser> {
  const result = await request.post(`/api/v2/iam/users/${data.id}/setEnabled`, {
    data: {
      enabled: data.enabled,
    },
  });
  return result?.data;
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: number): Promise<IManagerUser> {
  const result = await request.get(`/api/v2/iam/users/${id}`);
  return result?.data;
}

/**
 * 获取用户列表
 */
export async function getUserList(
  params?: IManageUserListParams,
): Promise<IResponseData<IManagerUser>> {
  const result = await request.get('/api/v2/iam/users', {
    params: {
      ...params,
      minPrivilege: params?.minPrivilege ?? 'update',
    },
  });
  return result?.data;
}

/**
 * 获取公共连接直接关联的用户和权限列表
 */
export async function getUserPermissionsList(params?: {
  resourceIdentifier: string;
}): Promise<IManagerUserPermission[]> {
  const result = await request.get('/api/v2/iam/userPermissions', {
    params,
  });
  return result?.data;
}

/**
 * 批量更新用户权限
 */
export async function batchUpdateUserPermissions(
  data: Partial<{
    resourceIdentifier: string;
    userActions: {
      userId: number;
      action: string;
    }[];
  }>,
): Promise<IManagerUserPermission[]> {
  const result = await request.post('/api/v2/iam/userPermissions/batchUpdateForConnection', {
    data,
  });
  return result?.data;
}

/**
 * 重置密码
 */
export async function resetPassword(data: {
  id: number;
  newPassword: string;
}): Promise<IManagerUser> {
  if (data) {
    data = Object.assign({}, data, { newPassword: encrypt(data.newPassword) });
  }
  const result = await request.post(`/api/v2/iam/users/resetPassword?id=${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 账号重名验证
 */
export async function getAccountExist(name: string): Promise<boolean> {
  const res = await request.get(`/api/v1/manage/user/exist`, {
    params: {
      name,
    },
  });
  return res?.data;
}

/**
 * 新建角色
 */
export async function createRole(data: Partial<IManagerRole>): Promise<IManagerRole> {
  const result = await request.post('/api/v2/iam/roles', {
    data,
  });
  return result?.data;
}

/**
 * 角色名称查重
 */
export async function getRoleExists(name: string): Promise<boolean> {
  const result = await request.get(`/api/v2/iam/roles/exists`, {
    params: {
      name,
    },
  });
  return result?.data;
}

/**
 * 删除角色
 */
export async function deleteRole(id: number): Promise<IManagerRole> {
  const result = await request.delete(`/api/v2/iam/roles/${id}`);
  return result?.data;
}

/**
 * 更新角色
 */
export async function updateRole(data: Partial<IRoleForUpdate>): Promise<IManagerRole> {
  const result = await request.put(`/api/v2/iam/roles/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 设置角色状态
 */
export async function setRoleEnable(data: { id: number; enabled: boolean }): Promise<IManagerRole> {
  const result = await request.post(`/api/v2/iam/roles/${data.id}/setEnabled`, {
    data: {
      enabled: data.enabled,
    },
  });
  return result?.data;
}

/**
 * 获取角色详情
 */
export async function getRoleDetail(roleId: number): Promise<IManagerRole> {
  const result = await request.get(`/api/v2/iam/roles/${roleId}`);
  return result?.data;
}

/**
 * 获取角色列表
 */
export async function getRoleList(
  params?: IRequestListParamsV2,
): Promise<IResponseData<IManagerRole>> {
  const result = await request.get('/api/v2/iam/roles', {
    params: {
      ...params,
      minPrivilege: params?.minPrivilege ?? 'update',
    },
  });
  return result?.data;
}

/**
 * 批量导入用户
 */
export async function batchImportUser(data: IManagerUser[]): Promise<IManagerUser[]> {
  const result = await request.post('/api/v2/iam/users/batchImport', {
    data,
  });
  return result?.data;
}

/**
 * 新建资源组
 */
export async function createResourceGroup(
  data: Partial<IManagerResourceGroup>,
): Promise<IManagerResourceGroup> {
  const result = await request.post('/api/v2/resource/resourcegroups/', {
    data,
  });
  return result?.data;
}

/**
 * 删除资源组
 */
export async function deleteResourceGroup(id: number): Promise<IManagerResourceGroup> {
  const result = await request.delete(`/api/v2/resource/resourcegroups/${id}`);
  return result?.data;
}

/**
 * 更新资源组
 */
export async function updateResourceGroup(
  data: Partial<IManagerResourceGroup>,
): Promise<IManagerResourceGroup> {
  const result = await request.put(`/api/v2/resource/resourcegroups/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 设置资源组状态
 */
export async function setPublicResourceGroup(data: {
  id: number;
  enabled: boolean;
}): Promise<IManagerResourceGroup> {
  const result = await request.post(`/api/v2/resource/resourcegroups/${data.id}/setEnabled`, {
    data,
  });
  return result?.data;
}

/**
 * 获取资源组详情
 */
export async function getResourceGroupDetail(connectionId: number): Promise<IManagerResourceGroup> {
  const result = await request.get(`/api/v2/resource/resourcegroups/${connectionId}`);
  return result?.data;
}

/**
 * 获取资源组列表
 */
export async function getResourceGroupList(params?: {
  nameLike?: string;
  status?: boolean[];
  sort?: string;
  page?: number;
  size?: number;
  minPrivilege?: string;
}): Promise<IResponseData<IManagerResourceGroup>> {
  const result = await request.get('/api/v2/resource/resourcegroups/', {
    params: {
      ...params,
      minPrivilege: params?.minPrivilege ?? 'update',
    },
  });
  return result?.data;
}

/**
 * 获取资源组名称是否重复
 */
export async function getResourceGroupExists(name: string): Promise<boolean> {
  const result = await request.get(`/api/v2/resource/resourcegroups/exists`, {
    params: {
      name,
    },
  });
  return result?.data;
}

/**
 * 获取用户权限详情
 */
export async function getCurrentUserPermissions(): Promise<IUser> {
  const result = await request.get(`/api/v2/iam/users/me`);
  return result?.data;
}

/**
 * 新建任务流程
 */
export async function createTaskFlow(data: Partial<ITaskFlow>): Promise<ITaskFlow> {
  const result = await request.post('/api/v2/regulation/approvalFlows', {
    data,
  });
  return result?.data;
}

/**
 * 删除任务流程
 */
export async function deleteTaskFlow(id: number): Promise<ITaskFlow> {
  const result = await request.delete(`/api/v2/regulation/approvalFlows/${id}`);
  return result?.data;
}

/**
 * 更新任务流程
 */
export async function updateTaskFlow(data: Partial<ITaskFlow>): Promise<ITaskFlow> {
  const result = await request.put(`/api/v2/regulation/approvalFlows/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 获取任务流程详情
 */
export async function getTaskFlowDetail(id: number): Promise<ITaskFlow> {
  const result = await request.get(`/api/v2/regulation/approvalFlows/${id}`);
  return result?.data;
}

/**
 * 获取任务流程列表
 */
export async function getTaskFlowList(
  params?: Partial<{
    name: string;
    sort: string;
    page: number;
    size: number;
  }>,
): Promise<IResponseData<ITaskFlow>> {
  const result = await request.get('/api/v2/regulation/approvalFlows', {
    params,
  });
  return result?.data;
}

/**
 * 任务流程名称 重名验证
 */
export async function getTaskFlowExists(name: string): Promise<boolean> {
  const result = await request.get('/api/v2/regulation/approvalFlows/exists', {
    params: {
      name,
    },
  });
  return result?.data;
}

/**
 * 获取任务流程中的角色列表
 */
export async function getResourceRoles(
  params?: IRequestListParamsV2,
): Promise<IResponseData<IResourceRole>> {
  const result = await request.get('/api/v2/iam/resourceRoles');
  return result?.data;
}

/**
 * 获取操作记录列表
 */
export async function getAuditList(params?: {
  type?: AuditEventType;
  action?: AuditEventActionType;
  fuzzyClientIPAddress?: string;
  fuzzyConnectionName?: string;
  fuzzyUsername?: string;
  result?: AuditEventResult;
  userId?: string;
  startTime?: number;
  endTime?: number;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IAudit>> {
  const result = await request.get('/api/v2/audit/events', {
    params,
  });
  return result?.data;
}

/**
 * 获取操作记录详情
 */
export async function getAuditDetail(id: number): Promise<IAudit> {
  const result = await request.get(`/api/v2/audit/events/${id}`);
  return result?.data;
}

/**
 * 获取操作记录事件类型
 */
export async function getAuditEventMeta(): Promise<IAuditEvent[]> {
  const result = await request.get('/api/v2/audit/eventMeta');
  return result?.data?.contents;
}

/**
 * 导出操作记录
 */
export async function exportAudit(data: Partial<IAuditExport>): Promise<string> {
  const result = await request.post('/api/v2/audit/events/export', {
    data,
  });
  return result?.data;
}

/**
 * 获取用户选项列表
 */
export async function getUserOptionList(): Promise<IResponseData<IManagerUser>> {
  const result = await request.get('/api/v2/audit/events/users');
  return result?.data;
}

/**
 * 获取连接选项列表
 */
export async function getConnectionOptionList(): Promise<IResponseData<IManagerPublicConnection>> {
  const result = await request.get('/api/v2/audit/events/connections');
  return result?.data;
}

/**
 * 新建脱敏规则
 */
export async function createMaskRule(data: Partial<IMaskRule>): Promise<IMaskRule> {
  const result = await request.post('/api/v2/mask/rules', {
    data,
  });
  return result?.data;
}

/**
 * 删除脱敏规则
 */
export async function deleteMaskRule(id: number): Promise<IMaskRule> {
  const result = await request.delete(`/api/v2/mask/rules/${id}`);
  return result?.data;
}

/**
 * 更新脱敏规则
 */
export async function updateMaskRule(data: Partial<IMaskRule>): Promise<IMaskRule> {
  const result = await request.put(`/api/v2/mask/rules/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 设置脱敏规则状态
 */
export async function setMaskRuleEnable(data: {
  id: number;
  enabled: boolean;
}): Promise<IMaskRule> {
  const result = await request.post(`/api/v2/mask/rules/${data.id}/setEnabled`, {
    data,
  });
  return result?.data;
}

/**
 * 获取脱敏规则详情
 */
export async function getMaskRule(connectionId: number): Promise<IMaskRule> {
  const result = await request.get(`/api/v2/mask/rules/${connectionId}`);
  return result?.data;
}

/**
 * 获取脱敏规则列表
 */
export async function getMaskRuleList(params?: {
  name?: string;
  enabled?: boolean[];
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IMaskRule>> {
  const result = await request.get('/api/v2/mask/rules', {
    params,
  });
  return result?.data;
}

/**
 * 获取脱敏规则名称是否重复
 */
export async function getMaskRuleExists(name: string): Promise<boolean> {
  const result = await request.post(`/api/v2/mask/rules/exists`, {
    data: {
      name,
    },
  });
  return result?.data;
}

/**
 * 测试脱敏规则
 */
export async function testMaskRule(data: Partial<IMaskRule>): Promise<string> {
  const result = await request.post('/api/v2/mask/rules/test', {
    data,
  });
  return result?.data;
}

/**
 * 获取自动授权规则列表
 */
export async function getAutoRuleList(params?: {
  name?: string;
  enabled?: boolean[];
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IAutoAuthRule>> {
  const result = await request.get('/api/v2/management/auto/rules', {
    params,
  });
  return result?.data;
}

/**
 * 设置自动授权规则状态
 */
export async function setAutoRuleEnable(data: {
  id: number;
  enabled: boolean;
}): Promise<IAutoAuthRule> {
  const result = await request.post(`/api/v2/management/auto/rules/${data.id}/setEnabled`, {
    data,
  });
  return result?.data;
}

/**
 * 删除自动授权规则
 */
export async function deleteAutoRule(id: number): Promise<IAutoAuthRule> {
  const result = await request.delete(`/api/v2/management/auto/rules/${id}`);
  return result?.data;
}

/**
 * 获取自动授权规则详情
 */
export async function getAutoRule(id: number): Promise<IAutoAuthRule> {
  const result = await request.get(`/api/v2/management/auto/rules/${id}`);
  return result?.data;
}

/**
 * 获取自动授权规则事件列表
 */
export async function getAutoRuleEventList(): Promise<IAutoAuthEvent[]> {
  const result = await request.get('/api/v2/management/auto/eventMetadata');
  return result?.data?.contents;
}

/**
 * 获取自动授权规则事件的推荐匹配表达式
 */
export async function getPromptExpression(eventName: string): Promise<IPromptVo> {
  const result = await request.get('/api/v2/management/auto/rules/prompt', {
    params: {
      eventName,
    },
  });
  return result?.data;
}

/**
 * 新建自动授权规则
 */
export async function createAutoRule(data: Partial<IAutoAuthRule>): Promise<IAutoAuthRule> {
  const result = await request.post('/api/v2/management/auto/rules', {
    data,
  });
  return result?.data;
}

/**
 * 更新自动授权规则
 */
export async function updateAutoRule(data: Partial<IAutoAuthRule>): Promise<IAutoAuthRule> {
  const result = await request.put(`/api/v2/management/auto/rules/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 自动授权规则名称是否重复
 */
export async function geteAutoRuleExists(name: string): Promise<boolean> {
  const result = await request.get(`/api/v2/management/auto/rules/exists`, {
    params: {
      name,
    },
  });
  return result?.data;
}

/**
 * 创建外部集成
 */
export async function createIntegration(
  data: Partial<IManagerIntegration>,
): Promise<IManagerIntegration> {
  const result = await request.post('/api/v2/integration/', {
    data,
  });
  return result?.data;
}

/**
 * 删除集成
 */
export async function deleteIntegration(id: number): Promise<IManagerIntegration> {
  const result = await request.delete(`/api/v2/integration/${id}`);
  return result?.data;
}

/**
 * 更新集成
 */
export async function updateIntegration(
  data: Partial<IManagerIntegration>,
): Promise<IManagerIntegration> {
  const result = await request.put(`/api/v2/integration/${data.id}`, {
    data,
  });
  return result?.data;
}

/**
 * 设置集成状态
 */
export async function setIntegration(data: {
  id: number;
  enabled: boolean;
}): Promise<IManagerIntegration> {
  const result = await request.post(`/api/v2/integration/${data.id}/setEnabled`, {
    data,
  });
  return result?.data;
}

/**
 * 获取集成详情
 */
export async function getIntegrationDetail(id: number): Promise<IManagerIntegration> {
  const result = await request.get(`/api/v2/integration/${id}`);
  return result?.data;
}

/**
 * 获取集成列表
 */
export async function getIntegrationList(params?: {
  name?: string;
  type?: IntegrationType;
  creatorName?: string;
  enabled?: boolean[];
  sort?: string;
  page?: number;
  size?: number;
}): Promise<IResponseData<IManagerIntegration>> {
  const result = await request.get('/api/v2/integration/', {
    params,
  });
  return result?.data;
}

/**
 * 获取集成名称是否重复
 */
export async function checkIntegrationExists(
  type: IntegrationType,
  name: string,
): Promise<boolean> {
  const result = await request.get(`/api/v2/integration/exists`, {
    params: {
      type,
      name,
    },
  });
  return result?.data;
}

export async function testClientRegistration(
  config: ISSOConfig,
  type: 'info' | 'test',
): Promise<{
  testLoginUrl: string;
  testId: string;
}> {
  const res = await request.post('/api/v2/sso/test/start', {
    data: {
      name: config?.name,
      type: IntegrationType.SSO,
      configuration: JSON.stringify(config),
      encryption: {
        enabled: true,
        algorithm: EncryptionAlgorithm.RAW,
        secret: config.ssoParameter?.secret,
      },
      enabled: true,
    },
    params: {
      type,
    },
  });
  return res?.data;
}

export async function getTestUserInfo(testId: string): Promise<string> {
  const res = await request.get('/api/v2/sso/test/info', {
    params: {
      testId,
    },
  });
  return res?.data;
}
