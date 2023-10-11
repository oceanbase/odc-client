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

import { PLType } from '@/constant/plType';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { formatMessage } from '@/util/intl';
import { ButtonType } from 'antd/lib/button'; // ODCUser
import { ReactNode } from 'react';

export interface IUser {
  email: string;
  desc: string;
  empId: number;
  gmt_create: number;
  gmt_modify: number;
  id: number;
  accountName: string;
  name: string;
  password: string;
  role: string;
  enabled: boolean;
  roles?: IManagerRole[];
  organizationId: number;
  systemOperationPermissions?: IPermission[];
  connectionAccessPermissions?: IPermission[];
  resourceManagementPermissions?: IPermission[];
}

export interface IPermission {
  resourceId: number;
  resourceType: string;
  actions: string[];
}

export interface IUserSummary {
  id: number;
  name: string;
  accountName: string;
  organizationId: number;
}

export interface IOrganization {
  id: number;
  createTime: string;
  updateTime: string;
  uniqueIdentifier: string;
  name: string;
  displayName: string;
  secret: string;
  description: string;
  builtin: boolean;
  type: 'TEAM' | 'INDIVIDUAL';
}

export enum SQL_OBJECT_TYPE {
  TABLE,
  VIEW,
  FUNCTION,
}

// 个人配置
export interface IUserConfig {
  'sqlexecute.defaultDelimiter': string;
  'sqlexecute.oracleAutoCommitMode': AutoCommitMode;
  'sqlexecute.mysqlAutoCommitMode': AutoCommitMode;
  'sqlexecute.defaultQueryLimit': string; // 大数值
  'connect.sessionMode': SQLSessionMode;
  'sqlexecute.defaultObjectDraggingOption': DragInsertType;
}

// 系统配置
export interface ISystemConfig {
  'odc.data.export.enabled': string;
  [key: string]: string;
}

// 自动提交模式
export enum AutoCommitMode {
  ON = 'ON',
  OFF = 'OFF',
}

export enum IManagerUserStatus {
  // 未激活
  INACTIVATE = 'INACTIVATE',
  // 停用
  DEACTIVATE = 'DEACTIVATE',
  // 启用
  ACTIVATE = 'ACTIVATE',
}

/**
 * SQL 窗口 Session 模式
 */
export enum SQLSessionMode {
  MultiSession = 'MultiSession',
  SingleSession = 'SingleSession',
}

export enum IManagerDetailTabs {
  DETAIL = 'DETAIL',
  RESOURCE = 'RESOURCE',
  ROLE = 'ROLE',
  TASK_FLOW = 'TASK_FLOW',
}
/**
 * ODC_CONNECTION
ODC_PROJECT
ODC_ROLE
ODC_USER
ODC_AUTOMATION_RULE
ODC_ENVIRONMENT
ODC_RISK_LEVEL
ODC_RULESET
ODC_INTEGRATION
ODC_RISK_DETECT_RULE
ODC_APPROVAL_FLOW_CONFIG
ODC_AUDIT_EVENT
 */
export enum IManagerResourceType {
  user = 'ODC_USER',
  role = 'ODC_ROLE',
  project = 'ODC_PROJECT',
  resource = 'ODC_CONNECTION',
  odc_audit_event = 'ODC_AUDIT_EVENT',
  data_masking = 'ODC_DATA_MASKING_RULE',
  flow_config = 'ODC_FLOW_CONFIG',
  auto_auth = 'ODC_AUTOMATION_RULE',
  approval_flow = 'ODC_APPROVAL_FLOW_CONFIG',
  risk_level = 'ODC_RISK_LEVEL',
  risk_detect = 'ODC_RISK_DETECT_RULE',
  ruleset = 'ODC_RULESET',
  integration = 'ODC_INTEGRATION',
  environment = 'ODC_ENVIRONMENT',
  individual_organization = 'ODC_INDIVIDUAL_ORGANIZATION',
}

export enum actionTypes {
  query = 'query',
  read = 'read',
  create = 'create',
  update = 'update',
  delete = 'delete',
  writeAndReadConnect = 'connect',
  readonlyconnect = 'readonlyconnect',
  apply = 'apply',
}

export enum IManagePagesKeys {
  INDEX = 'index',
  MEMBER_MANAGE = 'member_manage',
  USER = 'user',
  ROLE = 'role',
  PUBLIC_RESOURCE_MANAGE = 'public_resource_manage',
  CONNECTION = 'connection',
  RESOURCE = 'resource',
  AUTO_AUTH = 'auto_auth',
  RECORD = 'record',
  RISK_DATA = 'riskdata',
  TASK_FLOW = 'task',
  SECURITY_AUDIT = 'security_audit',
  MASK_DATA = 'mask_data',
  INTEGRATION_APPROVAL = 'integration_approval',
  SQL_INTERCEPTOR = 'sql_interceptor',
}

export interface IManagerUser {
  id: number;
  accountName: string;
  name: string;
  password: string;
  builtIn: boolean; // 是否是内置用户
  roleIds: number[];
  enabled: boolean;
  description: string;
  creatorName: string;
  createTime: number;
  updateTime: number;
  lastLoginTime: number;
  permissions: {
    id: number;
    userId: number;
    resourceIdentifier: number;
    action: string;
  }[];
  extraProperties?: Record<string, string>;
  errorMessage?: string;
}

export interface IManagerUserPermission {
  id: number;
  userId: number;
  userName: string;
  userAccountName: string;
  permissionId: number;
  resourceIdentifier: string;
  action: string;
  creatorId: number;
  organizationId: number;
  createTime: number;
  updateTime: number;
}

export interface IManagerRole {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
  builtIn: boolean; // 是否是内置用户
  systemOperationPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string[];
  }[];

  connectionAccessPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string[];
  }[];

  resourceManagementPermissions: {
    resourceType: string;
    resourceId: string;
    actions: string[];
  }[];

  description: string;
  creatorName: string;
  createTime: number;
  updateTime: number;
}

export enum IManagerRolePermissionType {
  connectionAccessPermissions = 'connectionAccessPermissions',
  resourceManagementPermissions = 'resourceManagementPermissions',
  systemOperationPermissions = 'systemOperationPermissions',
}

export interface IResourceRole {
  id: number;
  resourceType: string;
  roleName: string;
  description: string;
}
export interface IResponseDataPage {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface IResponseData<T> {
  contents: T[];
  page: IResponseDataPage;
}

export enum IConnectionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  UNKNOWN = 'UNKNOWN',
  NOPASSWORD = 'NOPASSWORD',
  DISABLED = 'DISABLED',
}

export enum AccountType {
  MAIN = 'MAIN', // 对应 v1版本 test
  READONLY = 'READONLY', // v2 新增，使用场景：公共连接
  SYS_READ = 'SYS_READ',
}

export enum CipherType {
  RAW = 'RAW',
  BCRYPT = 'BCRYPT',
  AES256SALT = 'AES256SALT',
}

export interface IManagerPublicConnection extends IConnection {
  // 权限信息（只读，读写）
  permittedActions: string[];
  creatorName: string;
  useSys?: boolean;
}

export interface IManagerResourceGroup {
  id: number;
  name: string;
  userId: number;
  creatorName: string;
  description: string;
  enabled: boolean;
  createTime: number;
  updateTime: number;
  connections: {
    name: string;
    id: number;
    enabled: boolean;
  }[];
}
// 外部集成
export interface IManagerIntegration {
  id: number;
  type: IntegrationType;
  name: string;
  configuration: string;
  enabled: boolean;
  encryption: Encryption;
  creatorId: number;
  creatorName: string;
  organizationId: number;
  description: string;
  createTime: number;
  updateTime: number;
  builtin: boolean;
}

export interface ITaskFlow {
  id: number;
  name: string;
  builtIn: boolean;
  approvalExpirationIntervalSeconds: number;
  executionExpirationIntervalSeconds: number;
  waitExecutionExpirationIntervalSeconds: number;
  referencedCount: number;
  nodes: ITaskFlowNode[];
  organizationId: number;
  createTime: number;
  description: string;
}

export interface ITaskFlowNode {
  resourceRoleId: number;
  resourceRoleName: string;
  externalApprovalId: number;
  externalApprovalName: string;
  autoApproval: boolean;
  sequenceNumber: number;
}

interface Encryption {
  enabled: boolean;
  secret: string;
  algorithm: EncryptionAlgorithm;
}

export enum EncryptionAlgorithm {
  AES256_BASE64 = 'AES256_BASE64',
  AES192_BASE64_4A = 'AES192_BASE64_4A',
  RAW = 'RAW',
}

export enum IntegrationType {
  // 集成审批
  APPROVAL = 'APPROVAL',
  // SQL 审核集成
  SQL_INTERCEPTOR = 'SQL_INTERCEPTOR',
  SSO = 'SSO',
}

export enum AuditEventType {
  // 个人配置
  PERSONAL_CONFIGURATION = 'PERSONAL_CONFIGURATION',
  // 成员管理
  MEMBER_MANAGEMENT = 'MEMBER_MANAGEMENT',
  // 密码管理
  PASSWORD_MANAGEMENT = 'PASSWORD_MANAGEMENT',
  // 连接管理
  CONNECTION_MANAGEMENT = 'CONNECTION_MANAGEMENT',
  // 脚本管理
  SCRIPT_MANAGEMENT = 'SCRIPT_MANAGEMENT',
  // 数据库操作
  DATABASE_OPERATION = 'DATABASE_OPERATION',
  // 组织配置
  ORGANIZATION_CONFIGURATION = 'ORGANIZATION_CONFIGURATION',
  // 资源组管理
  RESOURCE_GROUP_MANAGEMENT = 'RESOURCE_GROUP_MANAGEMENT',
  // 任务流程
  ASYNC = 'ASYNC',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  MOCKDATA = 'MOCKDATA',
  // 影子表
  SHADOWTABLE_SYNC = 'SHADOWTABLE_SYNC',
  // 分区计划
  PARTITION_PLAN = 'PARTITION_PLAN',
  // 操作记录
  AUDIT_EVENT = 'AUDIT_EVENT',
  // 流程配置
  FLOW_CONFIG = 'FLOW_CONFIG',
  // 脱敏规则
  DATA_MASKING_RULE = 'DATA_MASKING_RULE',
  // 脱敏策略
  DATA_MASKING_POLICY = 'DATA_MASKING_POLICY',
  // 计划变更
  ALTER_SCHEDULE = 'ALTER_SCHEDULE',
  // 数据库管理
  DATABASE_MANAGEMENT = 'DATABASE_MANAGEMENT',
  // 权限申请
  PERMISSION_APPLY = 'PERMISSION_APPLY',
  // 数据源管理
  DATASOURCE_MANAGEMENT = 'DATASOURCE_MANAGEMENT',
  // 项目管理
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  // 导出结果集
  EXPORT_RESULT_SET = 'EXPORT_RESULT_SET',
}

export enum AuditEventActionType {
  // 个人配置
  UPDATE_PERSONAL_CONFIGURATION = 'UPDATE_PERSONAL_CONFIGURATION',
  // 密码管理
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  SET_PASSWORD = 'SET_PASSWORD',
  // 连接管理
  CREATE_CONNECTION = 'CREATE_CONNECTION',
  DELETE_CONNECTION = 'DELETE_CONNECTION',
  UPDATE_CONNECTION = 'UPDATE_CONNECTION',
  USE_CONNECTION = 'CREATE_SESSION',
  QUIT_CONNECTION = 'CLOSE_SESSION',
  ENABLE_CONNECTION = 'ENABLE_CONNECTION',
  DISABLE_CONNECTION = 'DISABLE_CONNECTION',
  // 脚本管理
  CREATE_SCRIPT = 'CREATE_SCRIPT',
  UPDATE_SCRIPT = 'UPDATE_SCRIPT',
  DELETE_SCRIPT = 'DELETE_SCRIPT',
  UPLOAD_SCRIPT = 'UPLOAD_SCRIPT',
  DOWNLOAD_SCRIPT = 'DOWNLOAD_SCRIPT',
  /**
   * 组织配置
   */
  UPDATE_ORGANIZATION_CONFIGURATION = 'UPDATE_ORGANIZATION_CONFIGURATION',
  // 成员管理
  ADD_USER = 'ADD_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ADD_ROLE = 'ADD_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  ENABLE_USER = 'ENABLE_USER',
  DISABLE_USER = 'DISABLE_USER',
  ENABLE_ROLE = 'ENABLE_ROLE',
  DISABLE_ROLE = 'DISABLE_ROLE',
  // 资源组管理
  ADD_RESOURCE_GROUP = 'ADD_RESOURCE_GROUP',
  UPDATE_RESOURCE_GROUP = 'UPDATE_RESOURCE_GROUP',
  DELETE_RESOURCE_GROUP = 'DELETE_RESOURCE_GROUP',
  ENABLE_RESOURCE_GROUP = 'ENABLE_RESOURCE_GROUP',
  DISABLE_RESOURCE_GROUP = 'DISABLE_RESOURCE_GROUP',
  // 数据库操作
  SELECT = 'SELECT',
  DELETE = 'DELETE',
  INSERT = 'INSERT',
  REPLACE = 'REPLACE',
  UPDATE = 'UPDATE',
  SET = 'SET',
  DROP = 'DROP',
  ALTER = 'ALTER',
  TRUNCATE = 'TRUNCATE',
  CREATE = 'CREATE',
  OTHERS = 'OTHERS',
  // 任务流程
  ROLLBACK_TASK = 'ROLLBACK_TASK',
  CREATE_ASYNC_TASK = 'CREATE_ASYNC_TASK',
  CREATE_MOCKDATA_TASK = 'CREATE_MOCKDATA_TASK',
  CREATE_IMPORT_TASK = 'CREATE_IMPORT_TASK',
  CREATE_EXPORT_TASK = 'CREATE_EXPORT_TASK',
  STOP_ASYNC_TASK = 'STOP_ASYNC_TASK',
  STOP_MOCKDATA_TASK = 'STOP_MOCKDATA_TASK',
  STOP_IMPORT_TASK = 'STOP_IMPORT_TASK',
  STOP_EXPORT_TASK = 'STOP_EXPORT_TASK',
  EXECUTE_ASYNC_TASK = 'EXECUTE_ASYNC_TASK',
  EXECUTE_MOCKDATA_TASK = 'EXECUTE_MOCKDATA_TASK',
  EXECUTE_IMPORT_TASK = 'EXECUTE_IMPORT_TASK',
  EXECUTE_EXPORT_TASK = 'EXECUTE_EXPORT_TASK',
  APPROVE_ASYNC_TASK = 'APPROVE_ASYNC_TASK',
  APPROVE_MOCKDATA_TASK = 'APPROVE_MOCKDATA_TASK',
  APPROVE_IMPORT_TASK = 'APPROVE_IMPORT_TASK',
  APPROVE_EXPORT_TASK = 'APPROVE_EXPORT_TASK',
  REJECT_ASYNC_TASK = 'REJECT_ASYNC_TASK',
  REJECT_MOCKDATA_TASK = 'REJECT_MOCKDATA_TASK',
  REJECT_IMPORT_TASK = 'REJECT_IMPORT_TASK',
  REJECT_EXPORT_TASK = 'REJECT_EXPORT_TASK',
  // 影子表
  CREATE_SHADOWTABLE_SYNC_TASK = 'CREATE_SHADOWTABLE_SYNC_TASK',
  EXECUTE_SHADOWTABLE_SYNC_TASK = 'EXECUTE_SHADOWTABLE_SYNC_TASK',
  APPROVE_SHADOWTABLE_SYNC_TASK = 'APPROVE_SHADOWTABLE_SYNC_TASK',
  REJECT_SHADOWTABLE_SYNC_TASK = 'REJECT_SHADOWTABLE_SYNC_TASK',
  STOP_SHADOWTABLE_SYNC_TASK = 'STOP_SHADOWTABLE_SYNC_TASK',
  // 分区管理
  CREATE_PARTITION_PLAN_TASK = 'CREATE_PARTITION_PLAN_TASK',
  STOP_PARTITION_PLAN_TASK = 'STOP_PARTITION_PLAN_TASK',
  EXECUTE_PARTITION_PLAN_TASK = 'EXECUTE_PARTITION_PLAN_TASK',
  APPROVE_PARTITION_PLAN_TASK = 'APPROVE_PARTITION_PLAN_TASK',
  REJECT_PARTITION_PLAN_TASK = 'REJECT_PARTITION_PLAN_TASK',
  // 导出操作记录
  EXPORT_AUDIT_EVENT = 'EXPORT_AUDIT_EVENT',
  // 流程管理
  CREATE_FLOW_CONFIG = 'CREATE_FLOW_CONFIG',
  UPDATE_FLOW_CONFIG = 'UPDATE_FLOW_CONFIG',
  ENABLE_FLOW_CONFIG = 'ENABLE_FLOW_CONFIG',
  DISABLE_FLOW_CONFIG = 'DISABLE_FLOW_CONFIG',
  DELETE_FLOW_CONFIG = 'DELETE_FLOW_CONFIG',
  BATCH_DELETE_FLOW_CONFIG = 'BATCH_DELETE_FLOW_CONFIG',
  // 数据脱敏 规则
  CREATE_DATA_MASKING_RULE = 'CREATE_DATA_MASKING_RULE',
  UPDATE_DATA_MASKING_RULE = 'UPDATE_DATA_MASKING_RULE',
  ENABLE_DATA_MASKING_RULE = 'ENABLE_DATA_MASKING_RULE',
  DISABLE_DATA_MASKING_RULE = 'DISABLE_DATA_MASKING_RULE',
  DELETE_DATA_MASKING_RULE = 'DELETE_DATA_MASKING_RULE',
  // 数据脱敏 策略
  CREATE_DATA_MASKING_POLICY = 'CREATE_DATA_MASKING_POLICY',
  UPDATE_DATA_MASKING_POLICY = 'UPDATE_DATA_MASKING_POLICY',
  DELETE_DATA_MASKING_POLICY = 'DELETE_DATA_MASKING_POLICY',
  // 计划变更
  CREATE_ALTER_SCHEDULE_TASK = 'CREATE_ALTER_SCHEDULE_TASK',
  STOP_ALTER_SCHEDULE_TASK = 'STOP_ALTER_SCHEDULE_TASK',
  EXECUTE_ALTER_SCHEDULE_TASK = 'EXECUTE_ALTER_SCHEDULE_TASK',
  APPROVE_ALTER_SCHEDULE_TASK = 'APPROVE_ALTER_SCHEDULE_TASK',
  REJECT_ALTER_SCHEDULE_TASK = 'REJECT_ALTER_SCHEDULE_TASK',
  // 数据库管理
  ADD_DATABASE = 'ADD_DATABASE',
  TRANSFER_DATABASE_TO_PROJECT = 'TRANSFER_DATABASE_TO_PROJECT',
  DELETE_DATABASE = 'DELETE_DATABASE',
  // 权限申请
  CREATE_PERMISSION_APPLY_TASK = 'CREATE_PERMISSION_APPLY_TASK',
  APPROVE_PERMISSION_APPLY_TASK = 'APPROVE_PERMISSION_APPLY_TASK',
  REJECT_PERMISSION_APPLY_TASK = 'REJECT_PERMISSION_APPLY_TASK',
  // 数据源管理
  CREATE_DATASOURCE = 'CREATE_DATASOURCE',
  DELETE_DATASOURCE = 'DELETE_DATASOURCE',
  UPDATE_DATASOURCE = 'UPDATE_DATASOURCE',
  // 项目管理
  CREATE_PROJECT = 'CREATE_PROJECT',
  // 导出结果集
  CREATE_EXPORT_RESULT_SET_TASK = 'CREATE_EXPORT_RESULT_SET_TASK',
  APPROVE_EXPORT_RESULT_SET_TASK = 'APPROVE_EXPORT_RESULT_SET_TASK',
  REJECT_EXPORT_RESULT_SET_TASK = 'REJECT_EXPORT_RESULT_SET_TASK',
  EXECUTE_EXPORT_RESULT_SET_TASK = 'EXECUTE_EXPORT_RESULT_SET_TASK',
  STOP_EXPORT_RESULT_SET_TASK = 'STOP_EXPORT_RESULT_SET_TASK',
}

export enum AuditEventDialectType {
  OB_MYSQL = 'OB_MYSQL',
  OB_ORACLE = 'OB_ORACLE',
  ORACLE = 'ORACLE',
  MYSQL = 'MYSQL',
  UNKNOWN = 'UNKNOWN',
}

export enum AuditEventResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface IAudit {
  id: number;
  type: AuditEventType;
  action: AuditEventActionType;
  connectionId: number;
  connectionName: string;
  connectionHost: string;
  connectionPort: number;
  connectionClusterName: string;
  connectionTenantName: string;
  connectionUsername: string;
  connectionDialectType: AuditEventDialectType;
  clientIpAddress: string;
  serverIpAddress: string;
  detail: string; // json string
  result: AuditEventResult;
  userId: number;
  username: string;
  organizationId: number;
  taskId: number;
  startTime: number;
  endTime: number;
}

export interface IAuditEvent {
  id: number;
  methodSignature: string;
  type: AuditEventType;
  action: AuditEventActionType;
  sidExtractExpression: string;
  inConnection: boolean;
  enabled: boolean;
}

export interface IAuditExport {
  eventActions: AuditEventActionType[];
  userIds: number[];
  connectionIds: number[];
  results: AuditEventResult;
  format: 'Excel' | 'CSV';
  startTime: number;
  endTime: number;
}

// 用户保存的脚本

export type ISQLScript = IScriptMeta;

export enum ConnectionMode {
  MYSQL = 'MYSQL',
  ORACLE = 'ORACLE',
  OB_MYSQL = 'OB_MYSQL',
  OB_ORACLE = 'OB_ORACLE',
  ALL = 'ALL',
}

export enum IConnectionType {
  PRIVATE = 'PRIVATE', // 个人连接
  ORGANIZATION = 'ORGANIZATION',
  ALL = 'ALL',
}

export interface IManageUserListParams {
  authorizedResource?: string;
  includePermission?: boolean;
  roleId?: number[];
  name?: string;
  accountName?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sort?: string;
  minPrivilege?: string;
}

export interface IRequestListParamsV2 {
  page?: number;
  size?: number;
  minPrivilege?: string;
  [key: string]: any;
}

export interface IConnection {
  id: number; // sid
  ownerId: number;
  environmentId: number;
  environmentName: string;
  environmentStyle: string;
  sslConfig: {
    enabled: boolean;
    clientCertObjectId?: string;
    clientKeyObjectId?: string;
    CACertObjectId?: string;
  };

  organizationId: number;
  creatorId: number; // userId
  creator: string;
  name: string; // 连接名称，sessionName
  dialectType: ConnectionMode; // dbMode
  host: string; // 主机，公有云连接格式为 {domain}:{port}
  port: number; // 端口，公有云连接不需要设置 port
  clusterName: string; // OceanBase 集群称，cluster 公有云连接不需要设置
  tenantName: string; // OceanBase 租户名称，tenant 公有云连接不需要设置
  username: string; // 数据库登录用户名，dbUser
  password: string; // 连接密码，null 表示不设置，空字符串表示空密码，当 passwordSaved=true 时，不能为 null
  passwordEncrypted: string;
  sysTenantUsername: string; // 系统租户账号用户名称，sysUser
  sysTenantPassword: string; // 系统租户账号密码，sysUserPassword, sysTenantUsername 为 null 时无效，空字符串表示空密码
  queryTimeoutSeconds: number; // 查询超时时间（单位：秒），sessionTimeoutS
  createTime: number; // 创建时间，gmtCreated
  updateTime: number; // 修改时间，gmtModified
  status: {
    status: IConnectionStatus; // 连接状态，注意不是 Session 状态
    errorMessage: string;
  };

  properties: any;
  copyFromId: number; // 从 copyFromSid 的配置拷贝密码字段的值，对应 /api/v1 的 copyFromSid <br>\n- 值为 null：不拷贝 <br>\n- 值不为 null： 则当密码字段为 null 时，从 copyFromSid 连接信息里拷贝密码字段
  lastAccessTime: string; // 最近一次访问连接时间
  enabled: boolean; // 是否启用，对应v1版本的active，v1版本该字段并没有有效值
  passwordSaved: boolean; // 是否保存密码
  cipher: CipherType; // 加密算法
  salt: string;
  configUrl?: string; // v1版本保留，v2版本后端已经不支持，前端暂先保留
  temp?: boolean; // 是否是隐藏连接
  cloudDBAddress?: string; // v1版本保留 v2版本后端没有这个字段，可能是前段动态生成的值
  sessionTimeout?: number; // 公有云字段, v1 是 sessionTimeoutS, 对应 v2的queryTimeoutSeconds
  permittedActions?: string[];
  supportedOperations?: string[];
  type: ConnectType;
  errorMessage?: string;
  jdbcUrlParameters?: Record<string, string>;
  sessionInitScript?: string;
}

export interface IConnectionLabel {
  labelName: string;
  labelColor: string;
  id: number;
  gmtCreated?: ITimestamp;
  gmtModified?: ITimestamp;
  userId?: string | number;
}

export interface IConnectionConfigModal {
  title: string;
  content?: string[];
  viewMethods?: {
    method: string;
    url: string;
    type?: string;
  }[];

  url?: string;
  desc?: string;
  logo?: string;
  titleLogo?: string;
  footerLogo?: string;
  showType?: string;
}

export interface ITimestamp {
  date: number;
  day: number;
  hours: number;
  minutes: number;
  month: number;
  nanos: number;
  seconds: number;
  time: number;
  timezoneOffset: number;
  year: number;
}

export interface IConnectionFormData extends Partial<IConnection> {
  addressType?: ConnectionAddressType;
  useSys?: boolean;
}

export interface IRemoteCustomConnectionData extends IConnectionFormData {
  /** “用户名@租户名#集群名”或者“集群名:租户名:用户名” */
  unionDbUser?: string;
  /** 额外参数 */
  interceptData?: {
    [key: string]: any;
  };

  /**
   * 登录 token
   */
  accountVerifyToken?: string;
}

export enum IConnectionPropertyType {
  STRING = 'string',
  TEXT = 'text',
  NUMERIC = 'numeric',
  ENUM = 'enum',
  BOOLEAN = 'boolean',
  FLIP_BOOLEAN = 'flip_boolean',
  AUTOCOMPLETE = 'autocomplete',
  MULTISELECT = 'multiselect',
  TIMESTAMP = 'timestamp',
  YEAR = 'year',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  OBJECT = 'object',
}

export enum IConnectionTestErrorType {
  UNKNOWN_HOST = 'ConnectionUnknownHost',
  HOST_UNREACHABLE = 'ConnectionHostUnreachable',
  UNKNOWN_PORT = 'ConnectionUnknownPort',
  ILLEGAL_CONNECT_TYPE = 'ConnectionUnsupportedConnectType',
  OB_ACCESS_DENIED = 'ObAccessDenied',
  OB_MYSQL_ACCESS_DENIED = 'ObMysqlAccessDenied',
  UNKNOWN = 'Unknown',
  CONNECT_TYPE_NOT_MATCH = 'ConnectionDatabaseTypeMismatched',
}

export interface IConnectionProperty {
  key: string;
  value: string;
  unit?: string;
  valueType: IConnectionPropertyType;
  valueEnums?: string[];
  initialValue: string;
  modified?: boolean; // 前端修改标志

  changed: boolean; // 后端保存的修改标记
}
export enum ConnectionAddressType {
  HOST_PORT = 'HOST_PORT',
  CONFIG_URL = 'CONFIG_URL',
}

export enum PageType {
  SQL = 'SQL',
  PL = 'PL',
  CREATE_TABLE = 'CREATE_TABLE',
  TABLE = 'TABLE',
  DATABASE = 'DATABASE',
  SESSION_PARAM = 'SESSION_PARAM',
  SESSION_MANAGEMENT = 'SESSION_MANAGEMENT',
  RECYCLE_BIN = 'RECYCLE_BIN',
  VIEW = 'VIEW',
  CREATE_VIEW = 'CREATE_VIEW',
  FUNCTION = 'FUNCTION',
  CREATE_FUNCTION = 'CREATE_FUNCTION',
  PROCEDURE = 'PROCEDURE',
  CREATE_PROCEDURE = 'CREATE_PROCEDURE',
  CREATE_SEQUENCE = 'CREATE_SEQUENCE',
  SEQUENCE = 'SEQUENCE',
  CREATE_PACKAGE = 'CREATE_PACKAGE',
  EDIT_PACKAGE = 'EDIT_PACKAGE',
  EDIT_PL = 'EDIT_PL',
  PACKAGE = 'PACKAGE',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TASKS = 'TASKS',
  OB_CLIENT = 'OB_CLIENT',
  CREATE_TRIGGER = 'CREATE_TRIGGER', // 触发器创建页
  CREATE_TRIGGER_SQL = 'CREATE_TRIGGER_SQL', // 触发器创建页
  TRIGGER = 'TRIGGER', // 触发器详情页
  CREATE_TYPE = 'CREATE_TYPE', // 类型创建页
  TYPE = 'TYPE', // 类型详情页
  CREATE_SYNONYM = 'CREATE_SYNONYM', // 同义词创建页
  SYNONYM = 'SYNONYM',
  SQL_RESULTSET_VIEW = 'SQL_RESULTSET_VIEW', // 结果集查看页面
  BATCH_COMPILE_FUNCTION = 'BATCH_COMPILE_FUNCTION', // 批量编译
  BATCH_COMPILE_PACKAGE = 'BATCH_COMPILE_PACKAGE',
  BATCH_COMPILE_PROCEDURE = 'BATCH_COMPILE_PROCEDURE',
  BATCH_COMPILE_TRIGGER = 'BATCH_COMPILE_TRIGGER',
  BATCH_COMPILE_TYPE = 'BATCH_COMPILE_TYPE',
  TUTORIAL = 'TUTORIAL',
}

export interface IPage {
  key: string;
  title: string;
  type: PageType;
  startSaving?: boolean;
  isSaved: boolean;
  isDocked?: boolean; // 是否常驻
  params?: any; // 附加参数
}
export interface ISQLPage extends IPage {
  resultSets: IResultSet[];
}

export enum ColumnOrder {
  ASC = 'ASC',
  DESC = 'DESC',
  NONE = 'NONE',
}

export interface IColumn {
  key: string;
  name: string;
  editable: boolean;
  editor?: ReactNode;
  ellipsis?: boolean;
  valueType?: IConnectionPropertyType;
  modified?: boolean;
  order?: ColumnOrder;
  dataType?: string;
  formatter?: ({ value }: { value: string }) => void;
  width?: number;
  scale?: number;
  precision?: number;
  nativeDataType?: string;
  length?: number;
}

export interface ResultSetColumn {
  /**
   * 唯一标识set column的key，客户端自己生成
   */
  key: string;
  /**
   * 展示的名字，例如别名
   */
  name: string;
  /**
   * 实际对应的列名
   */
  columnName: string;
  columnType: string;
  columnComment: string;
  internal: boolean;
  readonly: boolean;
  /**
   * 是否脱敏
   */
  masked?: boolean;
}

// @ts-ignore

export interface IResultSet extends Partial<ISqlExecuteResult> {
  type?: 'DDL' | 'DML' | 'LOG';
  uniqKey?: string;
  columns: ResultSetColumn[];
  columnsToDisplay?: string[];
  rows: any[];
  traceId?: string;
  selectedIndexes?: any[]; // 后端使用子 SQL 拼接 limit 解决

  initialSql: string;
  /** 用户输入的SQL，用来判断编辑的时候使用 */
  originSql?: string;
  // 是否锁定
  locked?: boolean;
  // 是否支持编辑
  editable?: boolean;
  // 是否正在编辑
  isEditing?: boolean;
  allowExport?: boolean;
  columnList?: ITableColumn[]; // 是否已经查询过支持编辑，该接口响应很慢，尽可能少调用
  resultSetMetaData?: {
    columnList?: ITableColumn[];
    fieldMetaDataList?: IColumnMetaData[];
    table?: ITable;
    editable: boolean;
  };

  isQueriedEditable?: boolean;
  logTypeData?: {
    track: string;
    status: ISqlExecuteResultStatus;
    total: number;
    executeSql: string;
    dbmsOutput: string;
    statementWarnings: string;
    sqlType: SqlType;
    checkViolations: {
      col: number;
      localizedMessage: string;
      row: number;
      text: string;
      level?: number;
      type: string;
    }[];
  }[];

  schemaName?: string;
}

export interface IColumnMetaData {
  columnLabel: string;
  columnComment: string;
  readonly: boolean;
  [key: string]: any;
}

/** 日志相关 */
export enum ILogType {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface ILogItem {
  type: ILogType;
  message: string;
  timestamp?: string;
}

export enum ResourceTabKey {
  TABLE = 'TABLE',
  VIEW = 'VIEW',
  FUNCTION = 'FUNCTION',
  PROCEDURE = 'PROCEDURE',
  SEQUENCE = 'SEQUENCE',
  PACKAGE = 'PACKAGE',
  // 触发器
  TRIGGER = 'TRIGGER',
  // 类型
  TYPE = 'TYPE',
  // 同义词
  SYNONYM = 'SYNONYM',
}

/** 数据库 Schema 相关 */

// 数据库详情

export interface IDatabaseShardRule {
  instanceNum: number;
  jdbc: string;
  shardNum: number;
}

export interface IDataType {
  databaseType: string;
  showType: ColumnShowType;
}

// 表

export interface ITable {
  sid: string;
  tableName: string;
  databaseName: string;
  tableSize: string;
  character: string;
  collation: string;
  comment: string;
  partitioned: boolean;
  ddlSql: string;
  databaseSid: string;
  gmtCreated: number;
  gmtModified: number;
  increment: number;
  columns: Partial<ITableColumn>[];
  indexes: Partial<ITableIndex>[];
  partitions: Partial<ITablePartition>[];
  constraints: Partial<ITableConstraint>[];
  _version?: any;
}

interface IEditable {
  key?: string;
  modified?: boolean;
  _created?: boolean;
  _deleted?: boolean;
  tableName?: string;
  initialValue?: any;
}

// 表字段

export interface ITableColumn extends IEditable {
  allowNull: boolean;
  autoIncreament: boolean;
  /**
   * @deprecated
   */
  columnName: string;
  name: string;
  comment: string;
  /**
   * @deprecated
   */
  dataType: string;
  type: string;
  dataShowType: ColumnShowType;
  defaultValue: any;
  length: number;
  ordinalPosition: number;
  primaryKey: boolean;
  typeName: string;
}

export enum ColumnShowType {
  BOOLEAN = 'BOOLEAN',
  TEXT = 'TEXT',
  OBJECT = 'OBJECT',
  NUMERIC = 'NUMERIC',
  TIMESTAMP = 'TIMESTAMP',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  YEAR = 'YEAR',
  MONTH = 'MONTH',
}

// 索引

export enum IndexRange {
  GLOBAL = 'GLOBAL',
  LOCAL = 'LOCAL',
}

export enum IndexType {
  PRIMARY = 'PRIMARY',
  UNIQUE = 'UNIQUE',
  NORMAL = 'NORMAL',
}

export interface ITableIndex extends IEditable {
  name: string;
  columnNames: string[];
  tableName: string;
  type: string;
  unique: boolean;
  comment: string;
  range: IndexRange;
  primaryKey: boolean;
}

// 分区规则

export enum IPartitionType {
  HASH = 'HASH',
  KEY = 'KEY',
  RANGE = 'RANGE',
  RANGE_COLUMNS = 'RANGE_COLUMNS',
  LIST = 'LIST',
  LIST_COLUMNS = 'LIST_COLUMNS',
  NONE = 'NONE',
}

export interface ITablePartition extends IEditable {
  avgRowLength: number;
  comment: string;
  desc: string;
  expression: string;
  partName: string;
  partNumber: number;
  partType: IPartitionType;
  partValues: string;
  position: number;
  subPartList: any[];
  tableRows: number;
  positionValid: boolean;
}

// 函数

export interface IFunction {
  ddl: string;
  definer: string;
  funName: string;
  returnType: string;
  status: string;
  params: IPLParam[];
  createTime?: number;
  modifyTime?: number;
  errorMessage: string;
  characteristic: IRoutineCharacteristic;
  variables: {
    varName: string;
    varType: string;
  }[];
}

export enum ParamMode {
  IN = 'IN',
  OUT = 'OUT',
  INOUT = 'INOUT',
}

export interface IRoutineCharacteristic {
  deterministic: boolean;
  dataNature: 'CONTAINS SQL' | 'NO SQL' | 'READS SQL' | 'MODIFIES SQL';
  sqlSecurity: 'DEFINER' | 'INVOKER';
}

export interface IPLParam {
  dataType: string;
  defaultValue: string;
  /**
   * odc 自定义属性，保存原value
   */
  originDefaultValue?: string;
  paramMode: ParamMode;
  paramName: string;
  seqNum: number;
  dragIdx: number;
}

// 存储过程

export interface IProcedure {
  ddl: string;
  definer: string;
  params: IPLParam[];
  proName: string;
  createTime: number;
  modifyTime: number;
  status: string;
  errorMessage: string;
  characteristic: IRoutineCharacteristic;
  variables: {
    varName: string;
    varType: string;
  }[];
}

// 程序包

export interface IPackage {
  packageBody?: {
    basicInfo: {
      ddl: string;
      definer: string;
      createTime: number;
      modifyTime: number;
    };
    variables: {
      varName: string;
      varType: string;
    }[];
    functions: any[];
    procedures: any[];
  };

  packageHead: {
    basicInfo: {
      ddl: string;
      definer: string;
      createTime: number;
      modifyTime: number;
    };
    variables: {
      varName: string;
      varType: string;
    }[];
    functions: any[];
    procedures: any[];
  };

  packageName: string;
  packageType: string;
  /**
   * 判断package加载来源
   */
  singleLoad?: boolean;
  status: string;
  errorMessage: string;
}

// 视图

export interface IView {
  checkOption?: string;
  columns: ITableColumn[];
  comment?: string;
  ddl: string;
  definer?: string;
  updatable?: boolean;
  viewName: string;
}

// 程序包

export interface IPackage {
  ddl: string;
  definer: string;
  updatable: boolean;
  packageName: string;
}

// 结果集，历史记录追加

// 触发器
interface ITriggerCell {
  name: string;
  owner: string;
  type: string;
  status: string;
  [key: string]: string;
}

export interface ITrigger {
  triggerName: string;
  enableState: TriggerState;
  owner: string;
  baseObject: ITriggerCell;
  correlation: ITriggerCell[];
  ddl: string;
  status: string;
  errorMessage: string;
}

// 触发器启用状态
export enum TriggerState {
  enabled = 'ENABLED',
  disabled = 'DISABLED',
}

export enum TriggerSchemaType {
  TABLE = 'TABLE',
}

export enum TriggerType {
  SIMPLE = 'SIMPLE',
}

export enum TriggerMode {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

export enum TriggerGrade {
  ROW = 'row',
}

export enum TriggerEvents {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface ITriggerBaseInfoForm {
  enableState: TriggerState;
  schemaMode: string;
  schemaName: string;
  schemaType: TriggerSchemaType;
  triggerName: string;
}

export interface ITriggerAdancedInfoForm {
  referencesNewValue: string;
  referencesOldValue: string;
  sqlExpression: string;
  triggerColumns: string[];
  triggerEvents: TriggerEvents[];
  triggerGrade: string;
  triggerMode: TriggerMode;
  triggerType: TriggerType;
}

export interface ITriggerFormData {
  baseInfo: ITriggerBaseInfoForm;
  adancedInfo: ITriggerAdancedInfoForm;
}

export interface ITriggerForm {
  enableState: TriggerState;
  references?: {
    referName: string;
    referenceType: string;
  }[];

  rowLevel: boolean;
  schemaMode: string;
  schemaName: string;
  schemaType: TriggerSchemaType;
  sqlExpression?: string;
  triggerEvents: {
    column?: string;
    dmlEvent: string;
  }[];

  triggerMode: TriggerMode;
  triggerName: string;
  triggerType: TriggerType;
}

// 类型
export interface IType {
  typeName: string;
  type: TypeCode;
  owner?: string;
  createTime?: number;
  lastDdlTime?: number;
  ddl?: string;
  status?: string;
  errorMessage: string;
  typeDetail: {
    functions: IFunction[];
    procedures: IProcedure[];
    variables: {
      varName: string;
      varType: string;
    }[];
  };
}

export enum TypeCode {
  OBJECT = 'OBJECT',
  VARRAY = 'VARRAY',
  TABLE = 'TABLE',
}

export interface ITypeForm {
  typeName: string;
  typeCode: TypeCode;
}

// 同义词
export interface ISynonym {
  synonymName: string;
  tableOwner: string;
  tableName: string;
  synonymType: SynonymType;
  ddl?: string;
  dbLink?: string;
  created?: number;
  lastDdlTime?: number;
  owner?: string;
  status?: string;
}

export enum SynonymType {
  PUBLIC = 'PUBLIC',
  COMMON = 'COMMON',
}

// 结果集，历史记录追加
export enum SqlType {
  create = 'CREATE',
  drop = 'DROP',
  alter = 'ALTER',
  show = 'SHOW',
  select = 'SELECT',
  insert = 'INSERT',
  update = 'UPDATE',
  delete = 'DELETE',
  sort = 'SORT',
  replace = 'REPLACE',
}

export enum DbObjectType {
  database = 'DATABASE',
  table = 'TABLE',
  view = 'VIEW',
  procedure = 'PROCEDURE',
  function = 'FUNCTION',
  sequence = 'SEQUENCE',
  package = 'PACKAGE',
  package_body = 'PACKAGE_BODY',
  trigger = 'TRIGGER',
  synonym = 'SYNONYM',
  public_synonym = 'PUBLIC_SYNONYM',
  type = 'TYPE',
  table_group = 'TABLE_GROUP',
  file = 'FILE',
}

export interface IResultTimerStage {
  stageName: string;
  startTimeMillis: number;
  totalDurationMicroseconds: number;
  subStages: IResultTimerStage[];
}

export interface ISqlExecuteResult {
  columns?: string[];
  executeSql: string;
  dbmsOutput?: string;
  messages?: string;
  rows?: any[];
  status: ISqlExecuteResultStatus;
  total?: number;
  // 是否含有告警信息
  statementWarnings: string;
  track?: string;
  typeNames?: {
    [key: string]: string;
  };

  id?: string;
  requestId?: string | number;
  sqlId?: string;
  types?: any;
  sqlType: SqlType;
  dbObjectType?: DbObjectType;
  dbObjectName?: string;
  connectionReset: boolean;
  /**
   * 透传，脱敏后端依赖
   */
  whereColumns?: string[];
  timer: {
    stages: IResultTimerStage[];
    startTimeMillis: number; // 开始时间
    totalDurationMicroseconds: number; // 总耗时
  };
  traceId?: string;
  generalSqlType?: GeneralSQLType;
  checkViolations: {
    col: number;
    localizedMessage: string;
    row: number;
    text: string;
    type: string;
  }[];
}

export enum ISqlExecuteResultStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export interface ISqlExecuteResultWidthData {
  data: ISqlExecuteResult[];
  errMsg: string;
  errCode?: string;
}

export enum FileType {
  csv = 'csv',
  sql = 'sql',
}

export enum GeneralSQLType {
  'DDL' = 'DDL',
  'DML' = 'DML',
  'DQL' = 'DQL',
  'OTHER' = 'OTHER',
}

export interface IExportResultSet {
  fileName: string;
  fileFormat: IExportResultSetFileType;
  fileEncoding: IMPORT_ENCODING;
  tableName: string;
  csvFormat: IExportResultSetCSVFormat;
}

export interface IRecycleObject {
  id: string;
  uniqueId: string;
  createTime: number;
  newName: string;
  objName: string;
  objType: string;
  originName: string;
  schema: string;
  initialNewName: string;
}

// 数据库会话

export interface IDatabaseSession {
  command: string;
  database: string;
  dbUser: string;
  executeTime: number;
  obproxyIp: string;
  sessionId: number;
  sql: string;
  srcIp: string;
  status: string;
}

export interface ISQLExplainTreeNode {
  id: number;
  operator: string;
  name: string;
  rowCount: number;
  cost: number;
  outputFilter: string;
  children?: ISQLExplainTreeNode[];
}

export interface ISQLExplain {
  tree: ISQLExplainTreeNode[];
  outline: string;
  originalText: string;
}

export interface ISQLExecuteDetail {
  affectedRows: number;
  execTime: number;
  hitPlanCache: true;
  physicalRead: number;
  planType: string;
  queueTime: number;
  reqTime: number;
  returnRows: number;
  rpcCount: number;
  sql: string;
  sqlId: string;
  ssstoreRead: number;
  totalTime: number;
  traceId: string;
  waitTime: number;
}

export enum TraceSpanNode {
  JDBC = 'JDBC',
  OBProxy = 'OBProxy',
  OBServer = 'OBServer',
}
export interface TraceSpan {
  logs: string;
  tags: any[];
  elapseMicroSeconds: number;
  parent: string;
  traceId: string;
  startTimestamp: string;
  endTimestamp: string;
  spanName: string;
  tenantId: number;
  host: string;
  port: number;
  logTraceId: string;
  node: TraceSpanNode;
  subSpans: TraceSpan[];
}

export enum ConstraintType {
  PRIMARY = 'PRIMARY',
  UNIQUE = 'UNIQUE',
  FOREIGN = 'FOREIGN',
  CHECK = 'CHECK',
  INVALID = 'INVALID',
}

export enum ConstraintDelayConfig {
  DEFERRABLE_INITIALLY_IMMEDIATE = 'DEFERRABLE INITIALLY IMMEDIATE',
  DEFERRABLE_INITIALLY_DEFERRED = 'DEFERRABLE INITIALLY DEFERRED',
  NOT_DEFERRABLE = 'NOT DEFERRABLE',
}

export enum ConstraintAction {
  CASCADE = 'CASCADE',
  NO_ACTION = 'NO ACTION',
  RESTRICT = 'RESTRICT',
  SET_NULL = 'SET NULL',
}

export interface ITableConstraint extends IEditable {
  // 基类属性
  columns?: string[];
  name: string;
  tableName?: string;
  type: ConstraintType;
  enable?: boolean;
  delayConfig?: ConstraintDelayConfig;
  refDatabase?: string;
  refTable?: string;
  refColumns?: string[];
  deleteAction?: ConstraintAction;
  updateAction?: ConstraintAction; // 检查约束

  condition?: string;
}

export enum DataTransferTaskLogType {
  ALL = 'ALL',
  WARN = 'WARN',
}

export enum CommonTaskLogType {
  ALL = 'ALL',
  WARN = 'WARN',
}

export interface IExportObj {
  tableName: string;
  partitioned: boolean;
  type: DatabaseObjectType.TABLE | DatabaseObjectType.VIEW;
}

/** 导出对象状态 */
export enum ITransferDataObjStatus {
  INITIAL = 'INITIAL',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  KILLED = 'KILLED',
  UNKNOWN = 'UNKNOWN',
}

/** 数据导入导出状态对象 */
export interface ITransferObjectInfo {
  status: ITransferDataObjStatus;
  name: string;
  schema: string;
  count: number;
  total: number;
  type: DbObjectType;
}

export interface ITransferSchemaInfo {
  count: number;
  name: string;
  schema: string;
  status: ITransferDataObjStatus;
  total: number;
  type: DbObjectType;
}

export interface IDataTransferTaskParams {
  log: string;
  status: TaskStatus;
  format: IMPORT_TYPE;
  userId: number;
  taskId: number;
  sessionName: string;
  taskType: 'IMPORT' | 'EXPORT';
  taskName: string;
  expanded: boolean; // 是否展开
  maskingPolicy: IMaskPolicy;
  logs: {
    [logType: string]: string;
  };

  // 4 类日志

  timers: {
    // 4 类日志的轮询定时器
    [logType: string]: number;
  };

  activeLogType: DataTransferTaskLogType;
  createTime?: number;
  taskConfig?: IDataTransferTaskConfig;
}

export enum DatabaseObjectType {
  INVALIDE = 'INVALIDE',
  TABLE = 'TABLE',
  INDEX = 'INDEX',
  VIEW = 'VIEW',
  DATABASE = 'DATABASE',
}

export enum TransferType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum TaskPageScope {
  CREATED_BY_CURRENT_USER = 'createdByCurrentUser',
  APPROVE_BY_CURRENT_USER = 'approveByCurrentUser',
}

export enum TaskPageType {
  ALL = 'ALL',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  DATAMOCK = 'MOCKDATA',
  ASYNC = 'ASYNC',
  PARTITION_PLAN = 'PARTITION_PLAN',
  SQL_PLAN = 'SQL_PLAN',
  DATASAVE = 'DATASAVE',
  SHADOW = 'SHADOWTABLE_SYNC',
  CREATED_BY_CURRENT_USER = 'createdByCurrentUser',
  APPROVE_BY_CURRENT_USER = 'approveByCurrentUser',
  ALTER_SCHEDULE = 'ALTER_SCHEDULE',
  SENSITIVE_COLUMN = 'SENSITIVE_COLUMN',
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  ONLINE_SCHEMA_CHANGE = 'ONLINE_SCHEMA_CHANGE',
  DATA_DELETE = 'DATA_DELETE',
  EXPORT_RESULT_SET = 'EXPORT_RESULT_SET',
}

export enum TaskType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  DATAMOCK = 'MOCKDATA',
  ASYNC = 'ASYNC',
  PARTITION_PLAN = 'PARTITION_PLAN',
  SQL_PLAN = 'SQL_PLAN',
  ALTER_SCHEDULE = 'ALTER_SCHEDULE',
  SHADOW = 'SHADOWTABLE_SYNC',
  DATA_SAVE = 'DATA_SAVE',
  PERMISSION_APPLY = 'PERMISSION_APPLY',
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  MIGRATION = 'DATA_ARCHIVE',
  ONLINE_SCHEMA_CHANGE = 'ONLINE_SCHEMA_CHANGE',
  DATA_DELETE = 'DATA_DELETE',
  EXPORT_RESULT_SET = 'EXPORT_RESULT_SET',
}

export enum TaskJobType {
  DATA_DELETE = 'DATA_DELETE',
}

export enum SubTaskType {
  DATA_ARCHIVE = 'DATA_ARCHIVE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_ARCHIVE_ROLLBACK = 'DATA_ARCHIVE_ROLLBACK',
  DATA_ARCHIVE_DELETE = 'DATA_ARCHIVE_DELETE',
  ASYNC = 'ASYNC',
}

export enum TaskSubType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  SELECT = 'SELECT',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  DROP = 'DROP',
  ALTER = 'ALTER',
  OTHER = 'OTHER',
}

export enum EnvPageType {
  DEV = 'DEV',
  TEST = 'TEST',
  PROD = 'PROD',
}

export enum RiskDetectRuleType {
  DEFAULT = 'DEFAULT',
  LOW = 'LOW',
  MIDDLE = 'MIDDLE',
  HIGH = 'HIGH',
}

export enum EnvType {
  DEV = 'DEV',
  TEST = 'TEST',
  PROD = 'PROD',
}
export interface IExportDbObject {
  dbObjectType: DbObjectType;
  objectName: string;
}

export enum ExportFormat {
  SQL = 'SQL',
  ODC = 'ODC',
  TEXT = 'TEXT',
}

export interface IDataTransferTaskConfig {
  format: ExportFormat;
  blankToNull: boolean;
  characFormat: string;
  exportFileMaxSize: string;
  columnSeparator: string;
  dropTable: boolean;
  encoding: string;
  columnDelimiter: string;
  exportDbObjects: IExportDbObject[];
  globalSnapshot: boolean;
  hasColumnTitle: boolean;
  importFileName: string;
  lineSeparator: string;
  onlyTransferDdl: boolean;
  rowsPerCommit: number;
  skippedDataType: string[];
  transferType: TransferType;
  truncateTable: boolean;
  userId: number;
}

export interface ISequence {
  cacheSize: number;
  nextCacheValue: string;
  cached: boolean;
  cycled: boolean;
  increament: number;
  maxValue: number;
  minValue: number;
  name: string;
  orderd: boolean;
  startValue: number;
  user: string;
  ddl: string;
}

export enum EXPORT_TYPE {
  CSV = 'CSV',
  SQL = 'SQL',
}

export enum EXPORT_CONTENT {
  DATA_AND_STRUCT,
  DATA,
  STRUCT,
}

export interface ExportFormData {
  projectId?: number;
  databaseName?: string;
  databaseId: number;
  executionStrategy: TaskExecStrategy;
  executionTime?: number;
  taskName: string;
  dataTransferFormat: EXPORT_TYPE;
  exportContent: EXPORT_CONTENT;
  batchCommit: boolean; // 是否批量提交
  encoding?: IMPORT_ENCODING;
  maskStrategy: string;
  useSys: boolean;
  description?: string;

  batchCommitNum: number;
  skippedDataType: string[];
  globalSnapshot: boolean; // 全局快照

  mergeSchemaFiles: boolean; // 合并为一个SQL文件
  withDropDDL: boolean; // Create 语句前添加 Drop 语句
  exportDbObjects: IExportDbObject[]; // 选择的表对象
  withColumnTitle: boolean;
  blankToNull: boolean; // 空串转空值

  columnSeparator: string; // 字段分割符号

  exportFileMaxSize: string | number; // 单个文件上限(MB)
  columnDelimiter: string; // 文本识别符

  lineSeparator: string; // 换行符号
  sysUser?: string;
  sysUserPassword?: string;
  overwriteSysConfig?: boolean;
  exportAllObjects?: boolean; // 导出整库
  exportFilePath?: string; // 桌面端导出路径
}

export enum IMPORT_TYPE {
  ZIP = 'ZIP',
  SQL = 'SQL',
  CSV = 'CSV',
}

/**
 * 数据类型
 */
export enum FILE_DATA_TYPE {
  SQL = 'SQL',
  CSV = 'CSV',
}

export interface CsvColumnMapping {
  destColumnName: string;
  destColumnType: string;
  destColumnPosition: number;
  firstLineValue: string;
  srcColumnName: string;
  srcColumnPosition: number;
  isSelected?: boolean;
}

export enum IMPORT_ENCODING {
  UTF8 = 'UTF_8',
  UTF16 = 'UTF_16',
  UTF32 = 'UTF_32',
  ISO = 'ISO_8859_1',
  ASCII = 'ASCII',
  GB2312 = 'GB2312',
  GBK = 'GBK',
  GB18030 = 'GB18030',
  BIG5 = 'BIG5',
}

export enum IMPORT_CONTENT {
  DATA_AND_STRUCT,
  DATA,
  STRUCT,
}

export interface ImportFormData {
  tableName?: string;
  databaseId: number;
  projectId?: number;
  databaseName?: string;
  executionStrategy: TaskExecStrategy;
  executionTime?: number;
  dataTransferFormat: FILE_DATA_TYPE; // 导入格式
  fileType: IMPORT_TYPE;
  useSys: boolean;
  sysUser?: string;
  sysUserPassword?: string;
  overwriteSysConfig?: boolean;
  stopWhenError: boolean;
  description?: string;

  encoding: IMPORT_ENCODING; // 文件编码

  importFileName: {
    response: {
      data: {
        acceptMore: boolean;
        external: boolean;
        fileName: string;
        format: FILE_DATA_TYPE;
        importObjects: Record<string, string[]>;
      };
    };

    error?: any;
    uid: string;
    name: string;
    status: string;
    originFileObj: File;
  }[];

  // 导入文件名

  importContent: IMPORT_CONTENT; // 导入内容类型

  batchCommitNum: number; // 批量提交数量

  replaceSchemaWhenExists: boolean;
  truncateTableBeforeImport: boolean; // 导入前清空数据

  skippedDataType: string[];
  skipHeader: boolean;
  blankToNull: boolean; // 空串转空值

  columnSeparator: string; // 字段分割符号

  columnDelimiter: string; // 文本识别符

  lineSeparator: string; // 换行符号
}

// 左侧结构树菜单所支持的key列表
export enum ResourceTreeNodeMenuKeys {
  // table & view & common
  BROWSER_SCHEMA = 'BROWSER_SCHEMA',
  BROWSER_DATA = 'BROWSER_DATA',
  CREATE_TABLE = 'CREATE_TABLE',
  CREATE_VIEW = 'CREATE_VIEW',
  CREATE_FUNCTION = 'CREATE_FUNCTION',
  CREATE_PROCEDURE = 'CREATE_PROCEDURE',
  OPEN_SQL_WINDOW = 'OPEN_SQL_WINDOW',
  COPY = 'COPY',
  OPEN_TABLE_SQLWINDOW = 'OPEN_TABLE_SQLWINDOW',
  COPY_NAME = 'COPY_NAME',
  COPY_SELECT = 'COPY_SELECT',
  COPY_INSERT = 'COPY_INSERT',
  COPY_UPDATE = 'COPY_UPDATE',
  COPY_DELETE = 'COPY_DELETE',
  BROWSER_DDL = 'BROWSER_DDL',
  DELETE_TABLE = 'DELETE_TABLE',
  RENAME_TABLE = 'RENAME_TABLE',
  REFRESH_TABLE = 'REFRESH_TABLE',
  EXPORT_TABLE = 'EXPORT_TABLE',
  IMPORT_TABLE = 'IMPORT_TABLE',
  MOCK_DATA = 'MOCK_DATA',
  DOWNLOAD = 'DOWNLOAD',
  // columnSet
  BROWSER_COLUMNS = 'BROWSER_COLUMNS',
  CREATE_COLUMN = 'CREATE_COLUMN',
  REFRESH_COLUMNS = 'REFRESH_COLUMNS',
  // column
  EDIT_COLUMN = 'EDIT_COLUMN',
  DELETE_COLUMN = 'DELETE_COLUMN',
  RENAME_COLUMN = 'RENAME_COLUMN',
  // indexSet
  BROWSER_INDEXES = 'BROWSER_INDEXES',
  CREATE_INDEX = 'CREATE_INDEX',
  REFRESH_INDEXES = 'REFRESH_INDEXES',
  // index
  EDIT_INDEX = 'EDIT_INDEX',
  DELETE_INDEX = 'DELETE_INDEX',
  RENAME_INDEX = 'RENAME_INDEX',
  // partitionSet
  BROWSER_PARTITIONS = 'BROWSER_PARTITIONS',
  CREATE_PARTITION = 'CREATE_PARTITION',
  REFRESH_PARTITIONS = 'REFRESH_PARTITIONS',
  // partition
  EDIT_PARTITION = 'EDIT_PARTITION',
  DELETE_PARTITION = 'DELETE_PARTITION',
  RENAME_PARTITION = 'RENAME_PARTITION',
  SPLIT_PARTITION = 'SPLIT_PARTITION',
  // constraintsSet
  BROWSER_CONSTRAINTS = 'BROWSER_CONSTRAINTS',
  CREATE_CONSTRAINT = 'CREATE_CONSTRAINT',
  REFRESH_CONSTRAINTS = 'REFRESH_CONSTRAINTS',
  // constraints
  EDIT_CONSTRAINT = 'EDIT_CONSTRAINT',
  DELETE_CONSTRAINT = 'DELETE_CONSTRAINT',
  RENAME_CONSTRAINT = 'RENAME_CONSTRAINT',
  REFRESH_CONSTRAINTES = 'REFRESH_CONSTRAINTES',
  // sequence
  CREATE_SEQUENCE = 'CREATE_SEQUENCE',
  UPDATE_SEQUENCE = 'UPDATE_SEQUENCE',
  DELETE_SEQUENCE = 'DELETE_SEQUENCE',
  REFRESH_SEQUENCE = 'REFRESH_SEQUENCE',
  // synonym
  CREATE_SYNONYM = 'CREATE_SYNONYM',
  DELETE_SYNONYM = 'DELETE_SYNONYM',
  REFRESH_SYNONYM = 'REFRESH_SYNONYM',
}

export interface TaskRecord<P> {
  projectId: number;
  id: number;
  type: TaskType;
  subTypes: string[];
  connection: {
    id: number;
    name: string;
    dbMode: ConnectionMode;
  };
  databaseId: number;
  databaseName: string;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };
  candidateApprovers: {
    id: number;
    name: string;
    accountName: string;
  }[];
  approvable: boolean;
  approveInstanceId?: number;
  rollbackable: boolean;
  createTime: number;
  completeTime: number;
  status: TaskStatus;
  riskLevel?: IRiskLevel;
  parameters?: P;
  executionStrategy?: TaskExecStrategy;
  executionTime?: number;
  description?: string;
  nodeList?: ITaskFlowNode[];
  progressPercentage: number;
}

export interface ICycleSubTaskRecord {
  createTime: number;
  id: number;
  jobGroup: TaskPageType.DATA_ARCHIVE | TaskPageType.SQL_PLAN;
  jobName: string;
  resultJson: string;
  status: TaskStatus;
  updateTime: number;
}

export interface ISubTaskRecord {
  createTime: number;
  fireTime: number;
  id: number;
  jobGroup: 'ONLINE_SCHEMA_CHANGE_START';
  jobName: string;
  resultJson: string;
  status: TaskStatus;
  updateTime: number;
  parametersJson: Record<string, any>;
  progressPercentage: number;
}

export interface ISubTaskRecords {
  tasks: ISubTaskRecord[];
}

export type TaskRecordParameters =
  | IDataTransferTaskParams
  | IAsyncTaskParams
  | IMockDataParams
  | IPermissionTaskParams
  | IPartitionPlanParams
  | ISQLPlanTaskParams
  | IAlterScheduleTaskParams
  | IResultSetExportTaskParams;

export interface ITaskResult {
  containQuery: boolean;
  errorRecordsFilePath: string;
  failCount: number;
  jsonFileName: string;
  records: string[];
  successCount: number;
  zipFileDownloadUrl: string;
  writeCount: number;
  conflictCount: number;
  ignoreCount: number;
  clearCount: number;
  exportZipFilePath?: string;
  rollbackPlanResult?: {
    error: string;
    generated: boolean;
    objectId: string;
    success: boolean;
  };
}

export enum MigrationInsertAction {
  INSERT_IGNORE = 'INSERT_IGNORE',
  INSERT_DUPLICATE_UPDATE = 'INSERT_DUPLICATE_UPDATE',
}

export interface IDataArchiveJobParameters {
  deleteAfterMigration: boolean;
  name: string;
  sourceDatabaseId: number;
  sourceDatabaseName?: string;
  sourceDataSourceName?: string;
  targetDataBaseId: number;
  targetDatabaseName?: string;
  targetDataSourceName?: string;
  migrationInsertAction?: MigrationInsertAction;
  tables: {
    conditionExpression: string;
    tableName: string;
  }[];
  variables: {
    name: string;
    pattern: string;
  }[];
}

export interface IDataClearJobParameters {
  deleteAfterMigration: boolean;
  name: string;
  sourceDatabaseId: number;
  sourceDatabaseName?: string;
  targetDataBaseId: number;
  targetDatabaseName?: string;
  tables: {
    conditionExpression: string;
    tableName: string;
  }[];
  variables: {
    name: string;
    pattern: string;
  }[];
}

export interface ISqlPlayJobParameters {
  delimiter: string;
  errorStrategy: string;
  queryLimit: number;
  timeoutMillis: number;
  sqlContent?: string;
  sqlObjectIds?: string[];
  sqlObjectNames?: string[];
}

export interface ICycleTaskRecord<T> {
  id: number;
  type: TaskType;
  databaseName: string;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };

  createTime: number;
  jobs?: unknown;
  approveInstanceId?: number;
  nextFireTimes: number[];
  status: TaskStatus;
  allowConcurrent: boolean;
  jobParameters: T;
  nodeList?: ITaskFlowNode[];
  triggerConfig?: ICycleTaskTriggerConfig;
  connection: {
    id: number;
    name: string;
    dbMode: ConnectionMode;
  };
  riskLevel?: IRiskLevel;
  description?: string;
}

export interface IDataArchiveTaskRecord {
  approvable: boolean;
  candidateApprovers: any;
  completeTime: number;
  connection: {
    id: number;
    name: string;
    dbMode: ConnectionMode;
  };
  createTime: number;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };
  databaseName: string;
  description: string;
  executionStrategy: TaskExecStrategy;
  executionTime: number;
  id: number;
  riskLevel: IRiskLevel;
  nodeList: ITaskFlowNode[];
  parameters: {
    progressPercentage: number;
    projectId: number;
    rollbackable: boolean;
    status: TaskStatus;
    subTypes?: unknown;
    type: TaskType;
    triggerConfig: ICycleTaskTriggerConfig;
    scheduleTaskParameters: {
      deleteAfterMigration: boolean;
      name: string;
      sourceDatabaseId: number;
      targetDataBaseId: number;
      tables: {
        conditionExpression: string;
        tableName: string;
      }[];
      variables: {
        name: string;
        pattern: string;
      }[];
    };
  };
}

export interface IAsyncTaskResultSet {
  columnLabels: string[];
  columns: string[];
  connectionReset: boolean;
  costMillis: number;
  dbObjectName: null;
  dbObjectNameList: [];
  dbObjectType: string;
  dbmsOutput: string;
  executeSql: string;
  existWarnings: boolean;
  generalSqlType: string;
  odcProcessCostMillis: number;
  originSql: string;
  resultSetMetaData: {
    columnList: ITableColumn[];
    editable: false;
    fieldMetaDataList: IColumnMetaData[];
    table: unknown;
  };

  rows: string[][];
  sqlId: string;
  sqlType: string;
  status: string;
  total: number;
  traceId: number;
  track: unknown;
  typeNames: Record<string, any>;
  types: unknown;
}

export interface ITaskLog {}

export interface CreateTaskRecord {
  projectId?: number;
  databaseId: number;
  taskType: TaskType;
  parameters: Record<string, any>;
  executionStrategy: TaskExecStrategy;
  executionTime?: number;
  description?: string;
}

export interface IAsyncTaskParams {
  timeoutMillis: number;
  errorStrategy: string;
  sqlContent: string;
  sqlObjectIds: string[];
  sqlObjectNames: string[];
  delimiter: string;
  queryLimit: number;
  rollbackSqlContent: string;
  rollbackSqlObjectIds: string[];
  rollbackSqlObjectNames: string[];
  generateRollbackPlan: boolean;
  parentFlowInstanceId?: number;
}

export interface IResultSetExportTaskParams {
  sql: string;
  fileFormat: IExportResultSetFileType;
  fileEncoding: IMPORT_ENCODING;
  tableName: string;
  saveSql: boolean;
  csvFormat: {
    isContainColumnHeader: boolean;
    isTransferEmptyString: boolean;
    columnSeparator: string;
    columnDelimiter: string;
    lineSeparator: string;
  };
  fileName: string;
  maxRows: string;
}

export enum RollbackType {
  // 引用
  REF = 'reference',
  // 自定义
  CUSTOM = 'CUSTOM',
}

export interface IPermissionTaskParams {
  applyInfoList: {
    actions: string[];
    resourceId: number;
    resourceType: string;
  }[];
}

export interface IMockDataParams {
  taskDetail?: string;
  writeCount?: number;
  conflictCount?: number;
  ignoreCount?: number;
  clearCount?: number;
  dbMode?: ConnectionMode;
}

export interface IPartitionPlanParams {
  connectionPartitionPlan: IConnectionPartitionPlan;
}

export interface ICycleTaskTriggerConfig {
  cronExpression?: string;
  days?: number[];
  hours?: number[];
  startAt?: number;
  triggerStrategy?: TaskExecStrategy;
}

export interface ISQLPlanTaskParams {
  taskType: TaskType.SQL_PLAN;
  operationType: TaskOperationType;
  scheduleTaskParameters: {
    timeoutMillis: number;
    errorStrategy: string;
    sqlContent: string;
    sqlObjectIds: string[];
    sqlObjectNames: string[];
    delimiter: string;
    queryLimit: number;
  };

  triggerConfig: ICycleTaskTriggerConfig;
}

export interface IAlterScheduleTaskParams {
  taskType: TaskType.ALTER_SCHEDULE;
  taskId: number;
  operationType: TaskOperationType;
  allowConcurrent: boolean;
  scheduleTaskParameters: {
    timeoutMillis: number;
    errorStrategy: string;
    sqlContent: string;
    sqlObjectIds: string[];
    sqlObjectNames: string[];
    delimiter: string;
    queryLimit: number;
  };

  triggerConfig: ICycleTaskTriggerConfig;
}

export interface IDataArchiveTaskParams {
  type: TaskType.DATA_ARCHIVE;
  taskId: number;
  operationType: TaskOperationType;
  allowConcurrent: boolean;
  description: string;
  misfireStrategy: string;
  triggerConfig: ICycleTaskTriggerConfig;
  scheduleTaskParameters: {
    deleteAfterMigration: boolean;
    name: string;
    sourceDatabaseId: number;
    targetDataBaseId: number;
    tables: {
      conditionExpression: string;
      tableName: string;
    }[];
    variables: {
      name: string;
      pattern: string;
    }[];
  };
}

export interface IConnectionPartitionPlan {
  databaseId: number;
  flowInstanceId?: number;
  inspectEnable: boolean;
  inspectTriggerStrategy: string;
  tablePartitionPlans: IPartitionPlanRecord[];
}

export enum TaskExecStrategy {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  TIMER = 'TIMER',
  START_NOW = 'START_NOW',
  START_AT = 'START_AT',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  CRON = 'CRON',
}

export enum TaskFlowNodeType {
  APPROVAL_TASK = 'APPROVAL_TASK',
  GATEWAY = 'GATEWAY',
  SERVICE_TASK = 'SERVICE_TASK',
  PRE_CHECK = 'PRE_CHECK',
}

export enum TaskOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  PAUSE = 'PAUSE',
  TERMINATION = 'TERMINATION',
  RESUME = 'RESUME',
}

export enum IFlowTaskType {
  PRE_CHECK = 'PRE_CHECK',
  GENERATE_ROLLBACK = 'GENERATE_ROLLBACK',
}

export interface ITaskFlowNode {
  status: TaskNodeStatus;
  nodeType: TaskFlowNodeType;
  taskType: IFlowTaskType;
  externalFlowInstanceUrl: string;
  completeTime: number;
  comment: string;
  deadlineTime: number;
  issueCount: number;
  unauthorizedDatabaseNames: string[];
  id?: number;
  candidates: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  }[];

  createTime: number;
  operator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };

  autoApprove: boolean;
}

export type TaskDetail<P> = TaskRecord<P>;

export type CycleTaskDetail<T> = ICycleTaskRecord<T>;

export type DataArchiveTaskDetail = IDataArchiveTaskRecord;

export interface IAsyncTaskParams {
  sqlContent: string;
  sqlFileName: string;
  successCount: number;
  failCount: number;
  records: string[];
  containQuery: boolean;
  zipFileDownloadUrl: string;
}

export enum TaskStatus {
  APPROVING = 'APPROVING', // 审批中
  REJECTED = 'REJECTED', // 审批不通过
  APPROVAL_EXPIRED = 'APPROVAL_EXPIRED', // 审批过期
  WAIT_FOR_EXECUTION = 'WAIT_FOR_EXECUTION', // 待执行
  WAIT_FOR_EXECUTION_EXPIRED = 'WAIT_FOR_EXECUTION_EXPIRED', // 等待执行过期
  EXECUTING = 'EXECUTING', // 执行中
  EXECUTION_SUCCEEDED = 'EXECUTION_SUCCEEDED', // 执行成功
  EXECUTION_FAILED = 'EXECUTION_FAILED', // 执行失败
  EXECUTION_EXPIRED = 'EXECUTION_EXPIRED', // 执行过期
  ROLLBACK_FAILED = 'ROLLBACK_FAILED', // 回滚失败
  ROLLBACK_SUCCEEDED = 'ROLLBACK_SUCCEEDED', // 已回滚
  CANCELLED = 'CANCELLED', // 已终止
  COMPLETED = 'COMPLETED', // 已完成
  WAIT_FOR_CONFIRM = 'WAIT_FOR_CONFIRM', // 确认分区策略
  // 其他： 前端不感知
  CREATED = 'CREATED', // 前端一般不感知，接口调用快的时候，可能会遇到（山露: 建议加上, 和 EXECUTING 一样的处理）
  APPROVED = 'APPROVED',
  // 周期任务独有的状态
  PAUSE = 'PAUSE',
  ENABLED = 'ENABLED',
  TERMINATION = 'TERMINATION',
  TIMEOUT = 'TIMEOUT',
  PRE_CHECK_FAILED = 'PRE_CHECK_FAILED',
}

export enum SubTaskStatus {
  PREPARING = 'PREPARING', // 已创建
  RUNNING = 'RUNNING', // 运行中
  DONE = 'DONE', // 执行完成
  FAILED = 'FAILED', // 执行失败
  CANCELED = 'CANCELED',
} // 执行取消

export enum StatusNodeType {
  FLOW_TASK = 'FLOW_TASK',
  CYCLE_TASK = 'CYCLE_TASK',
  SUB_TASK = 'SUB_TASK',
}

export enum TaskNodeStatus {
  CREATED = 'CREATED',
  EXECUTING = 'EXECUTING',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  WAIT_FOR_CONFIRM = 'WAIT_FOR_CONFIRM',
  PRE_CHECK_FAILED = 'PRE_CHECK_FAILED',
}

export enum SQLContentType {
  TEXT = 'TEXT',
  FILE = 'FILE',
}

/**
 * 解密tag
 */
export enum DECODE_TAG {
  SDYD = 'SD_MOBILE',
}

export interface TaskTools<T> {
  (record: T): {
    text: string;
    action?: any;
    /** 需要确认文案 */
    confirmText?: string;
    /** 下载地址 */
    download?: any;
    /** 按钮类型 */
    type?: ButtonType;
    /** 是否是查看按钮 */
    isOpenBtn?: boolean;
    isLoading?: boolean;
  }[];
}

/** 树形结构的菜单节点 */
export interface ITreeNode {
  title: ((e) => string) | string;
  key: string;
  icon?: ReactNode;
  actions?: string[][];
  children?: ITreeNode[];
  type?: string;
  theme?: string;
  topTab?: string;
  propsTab?: string;
  status?: ReactNode;
  plStatus?: string;
  root?: ITreeNode;
  parent?: ITreeNode;
  menu?: ITreeNodeMenu;
  origin?: any;
  dataRef?: any;
}

export interface ITreeNodeMenu {
  type: MenusType;
  icon?: ReactNode;
  disabled?: boolean;
  options?: any;
}

type TableMenuType =
  | DbObjectType.table
  | 'tableColumnSet'
  | 'tableColumn'
  | 'tableIndexSet'
  | 'tableIndex'
  | 'tablePartitionSet'
  | 'tablePartition'
  | 'tableConstraintsSet'
  | 'tableConstraint';

type ViewMenuType = DbObjectType.view;

type SequenceMenuType = 'sequence';

type SynonymMenuType = 'synonym';

export type MenusType = TableMenuType | ViewMenuType | SequenceMenuType | SynonymMenuType;

export enum TableTreeNode {
  TABLE = 'TABLE',
  COLUMN = 'COLUMN',
  INDEX = 'INDEX',
  PARTITION = 'PARTITION',
  CONSTRAINT = 'CONSTRAINT',
}

/** 触发器 属性 Tab key 枚举 */
export enum TriggerPropsTab {
  BASE_INFO = 'INFO',
  BASE_OBJECT = 'BASE_OBJECT',
  CORRELATION = 'CORRELATION',
  DDL = 'DDL',
}

/** 同义词 属性 Tab key 枚举 */
export enum SynonymPropsTab {
  BASE_INFO = 'INFO',
  DDL = 'DDL',
}

/** 类型 属性 Tab key 枚举 */
export enum TypePropsTab {
  BASE_INFO = 'INFO',
  CORRELATION = 'CORRELATION',
  DDL = 'DDL',
}

/**
 * 创建视图
 */

export interface ICreateViewColumn {
  columnName: string;
  aliasName?: string;
  dbName: string;
  tableName: string;
  tableAliasName?: string;
}

export interface ICreateViewViewUnit {
  dbName: string;
  tableName: string;
  tableAliasName?: string;
}

export interface ICreateView {
  viewName: string;
  checkOption: string;
  viewUnits?: ICreateViewViewUnit[];
  createColumns?: ICreateViewColumn[];
  operations?: string[];
}

export enum MockGenerator {
  RANGE_GENERATOR = 'RANGE_GENERATOR',
  STEP_GENERATOR = 'STEP_GENERATOR',
  UNIFORM_GENERATOR = 'UNIFORM_GENERATOR',
  FIX_GENERATOR = 'FIX_GENERATOR',
  FIX_CHAR_GENERATOR = 'FIX_CHAR_GENERATOR',
  BOOL_CHAR_GENERATOR = 'BOOL_CHAR_GENERATOR',
  REGEXP_GENERATOR = 'REGEXP_GENERATOR',
  RANDOM_GENERATOR = 'RANDOM_GENERATOR',
  RANDOM_DATE_GENERATOR = 'RANDOM_DATE_GENERATOR',
  FIX_DATE_GENERATOR = 'FIX_DATE_GENERATOR',
  STEP_DATE_GENERATOR = 'STEP_DATE_GENERATOR',
  NULL_GENERATOR = 'NULL_GENERATOR',
  SKIP_GENERATOR = 'SKIP_GENERATOR',
}

export interface IServerMockColumn {
  columnName: string;
  allowNull?: boolean;
  defaultValue?: boolean;
  typeConfig: {
    columnType: string;
    lowValue?: string | number;
    highValue?: string | number;
    genParams: {
      [key: string]: any;
    };

    generator: MockGenerator;
    width?: any;
    precision?: any;
    scale?: any;
  };
}

export interface IServerMockTable {
  columns: IServerMockColumn[];
  totalCount: number;
  strategy: string;
  batchSize: number;
  whetherTruncate: boolean;
  tableName: string;
  schemaName: string;
  writeCount?: number;
  conflictCount?: number;
  ignoreCount?: number;
  clearCount?: number;
}

export type IColumnSizeValue =
  | number
  | {
      isNumber: boolean;
      maxValue: string;
      minValue: string;
      scale: number;
    };

export interface IColumnSizeMap {
  [key: string]: IColumnSizeValue;
}

export interface ServerSystemInfo {
  buildTime: number;
  startTime: number;
  version: string;
  defaultRoles?: string[];
  profiles?: string[];
  webResourceLocation?: string;
  supportGroupQRCodeUrl?: string;
  maxScriptEditLength?: number;
  maxScriptUploadLength?: number;
  fileExpireHours?: number;
  /**
   * 反馈邮箱
   */
  supportEmail?: string;
  /**
   * 支持地址
   */
  supportUrl?: string;
  /**
   * 首页文案
   */
  homePageText?: string;
  /**
   * 模拟数据条数限制
   */
  mockDataMaxRowCount?: number;
  // 是否开启 登录验证码
  captchaEnabled?: boolean;
  spmEnabled?: boolean;
  /**
   * 是否开启队列机制
   */
  sessionLimitEnabled?: boolean;
  /**
   * 是否开启教程
   */
  tutorialEnabled?: boolean;
  /**
   * header标题
   */
  odcTitle?: string;
  /**
   * 是否屏蔽权限申请
   */
  applyPermissionHidden?: boolean;
  /**
   * 是否展示登录页
   */
  passwordLoginEnabled?: boolean;
  /**
   * 是否有三方登录
   */
  ssoLoginEnabled?: boolean;
  ssoLoginName?: string;
}

export enum ODCErrorsCode {
  LoginExpired = 'LoginExpired',
  UnauthorizedSessionAccess = 'UnauthorizedSessionAccess',
  ConnectionExpired = 'ConnectionExpired',
  ConnectionKilled = 'ConnectionKilled',
  SysTenantAccountNotSet = 'SysTenantAccountNotSet',
  SysTenantAccountInvalid = 'SysTenantAccountInvalid',
  PermissionChanged = 'PermissionChanged',
}

export enum ConnectType {
  NONE = 'NONE',
  OB_MYSQL = 'OB_MYSQL',
  OB_ORACLE = 'OB_ORACLE',
  CLOUD_OB_MYSQL = 'CLOUD_OB_MYSQL',
  CLOUD_OB_ORACLE = 'CLOUD_OB_ORACLE',
  ODP_SHARDING_OB_MYSQL = 'ODP_SHARDING_OB_MYSQL',
  MYSQL = 'MYSQL',
}

export enum DragInsertType {
  NAME = 'object_name',
  SELECT = 'select_stmt',
  INSERT = 'insert_stmt',
  UPDATE = 'update_stmt',
  DELETE = 'delete_stmt',
}

export enum SQLLintMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export interface IRecycleConfig {
  readonly objectExpireTime: string;
  recyclebinEnabled: boolean;
  truncateFlashbackEnabled: boolean;
}

export enum RSModifyDataType {
  RAW = 'RAW',
  FILE = 'FILE',
  HEX = 'HEX',
}

export class LobExt {
  public info: string;
  public type: RSModifyDataType;
  constructor(info, type) {
    this.info = info;
    this.type = type;
  }
}

export enum MaskRuleType {
  // 掩盖
  MASK = 'MASK',
  // 替换
  SUBSTITUTION = 'SUBSTITUTION',
  // 保留格式
  PSEUDO = 'PSEUDO',
  // 哈希
  HASH = 'HASH',
  // 取整
  ROUNDING = 'ROUNDING',
  // 置空
  NULL = 'NULL',
}

export const MaskRyleTypeMap = {
  // 掩盖
  MASK: formatMessage({ id: 'odc.src.d.ts.CoverUp' }), //掩盖 // 替换
  SUBSTITUTION: formatMessage({ id: 'odc.src.d.ts.Replace' }), //替换 // 保留格式
  PSEUDO: formatMessage({ id: 'odc.src.d.ts.ReservedFormat' }), //保留格式 // 哈希
  HASH: formatMessage({ id: 'odc.src.d.ts.Hash' }), //哈希 // 取整
  ROUNDING: formatMessage({ id: 'odc.src.d.ts.Rounding' }), //取整 // 置空
  NULL: formatMessage({ id: 'odc.src.d.ts.Empty' }), //置空
};

export enum MaskRuleCustomSegmentsType {
  // 位数
  DIGIT = 'DIGIT',
  // 位数比例
  DIGIT_PERCENTAGE = 'DIGIT_PERCENTAGE',
  // 其他位数
  LEFT_OVER = 'LEFT_OVER',
  // 指定分隔符前
  DELIMITER = 'DELIMITER',
}

export enum MaskRuleHashType {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SM3 = 'SM3',
}

export enum MaskRuleSegmentsType {
  // 展示前一后一
  PRE_1_POST_1 = 'PRE_1_POST_1',
  // 展示前三后二
  PRE_3_POST_2 = 'PRE_3_POST_2',
  // 展示前三后四
  PRE_3_POST_4 = 'PRE_3_POST_4',
  // 替换全部
  ALL = 'ALL',
  // 替换前三位
  PRE_3 = 'PRE_3',
  // 替换后四位
  POST_4 = 'POST_4',
  // 自定义
  CUSTOM = 'CUSTOM',
}

export interface IMaskRule {
  id: number;
  name: string;
  builtIn: boolean;
  type: MaskRuleType;
  enabled: boolean;
  createTime: number;
  updateTime: number;
  testValue: string;
  decimal: boolean;
  precision: number;
  characterCollection: string[];
  hashType: MaskRuleHashType;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };

  segmentsType: MaskRuleSegmentsType;
  replacedCharacters: string;
  segments: {
    mask: boolean;
    type: MaskRuleCustomSegmentsType;
    replacedCharacters: string;
    delimiter: string;
    digitPercentage: number;
    digitNumber: number;
  }[];
}

export interface IMaskPolicy {
  id: number;
  name: string;
  createTime: number;
  updateTime: number;
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };

  ruleApplyings: {
    rule: IMaskRule;
    includes: string[];
    excludes: string[];
  }[];
}

export interface IPartitionPlanRecordDetail {
  isAutoPartition: boolean;
  preCreatePartitionCount: number;
  expirePeriod: number;
  expirePeriodUnit: IPartitionPlanPeriodUnit;
  partitionInterval: number;
  partitionIntervalUnit: IPartitionPlanPeriodUnit;
  partitionNamingPrefix: string;
  partitionNamingSuffixExpression: string;
}

export interface IPartitionPlanRecord {
  flowInstanceId?: number;
  id?: number;
  schemaName: string;
  tableName: string;
  partitionCount: number;
  detail?: IPartitionPlanRecordDetail;
}

export interface IPartitionPlan {
  connectionId: number;
  flowInstanceId: number;
  inspectEnable: boolean;
  inspectTriggerStrategy: string;
  tablePartitionPlans: IPartitionPlanRecord[];
}

export enum IPartitionPlanPeriodUnit {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
}

export enum SchemaComparingResult {
  /**
   * 目标表不存在，需要新建表
   */
  CREATE = 'CREATE',

  /**
   * 表结构不一致，需要更新表结构
   */
  UPDATE = 'UPDATE',

  /**
   * 表结构一致，无需变更
   */
  NO_ACTION = 'NO_ACTION',

  /**
   * 等待分析
   */
  WAITING = 'WAITING',

  /**
   * 结构对比分析中
   */
  COMPARING = 'COMPARING',

  /**
   * 跳过分析
   */
  SKIP = 'SKIP',
}

export enum ConnectionFilterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  NOPASSWORD = 'NOPASSWORD',
  ALL = 'ALL',
}

export enum TransState {
  UNKNOWN = 'UNKNOWN',
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  TIMEOUT = 'TIMEOUT',
}

export interface ISessionStatus {
  sid: string;
  sessionId: string;
  state: string;
  transState: TransState;
  transId: string;
  sqlId: string;
  activeQueries: string;
}

export interface IAutoAuthEvent {
  id: number;
  name: string;
  builtin: boolean;
  description: string;
  variables: string[];
}

export interface IPromptVo {
  variableExpression: VariableExpression;
}

export type VariableExpression = { [key: string]: string[] };

export interface IAutoAuthRule {
  id?: number;
  name: string;
  eventId: number;
  enabled: boolean;
  conditions: {
    object: string;
    expression: string;
    operation: string;
    value: string;
  }[];
  actions: {
    action: string;
    arguments: {
      [key: string]: any;
    };
  }[];
  eventName: string;
  creatorId: number;
  creatorName: string;
  createTime: number;
  updateTime: number;
  description: string;
}

export interface IExportResultSetCSVFormat {
  isContainColumnHeader: boolean;
  isTransferEmptyString: boolean;
  columnSeparator: string;
  columnDelimiter: string;
  lineSeparator: string;
}

export enum IExportResultSetFileType {
  SQL = 'SQL',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
}
export type ObjectId = string | number;
export type ScriptId = string | number;
export interface IScriptMeta {
  /**
   * 脚本 id
   */
  id: ScriptId;
  updateTime: number;
  /**
   * 文件对象的 id
   */
  objectId: ObjectId;
  objectName: string;
  /**
   * 内容摘要，截取前 xx 字符
   */
  scriptAbstract: string;
  contentLength: number;
}

export interface IScript {
  content: string;
  scriptMeta: IScriptMeta;
}

export enum ISSOType {
  OIDC = 'OIDC',
  OAUTH2 = 'OAUTH2',
}

export enum IClientAuthenticationMethod {
  basic = 'basic',
  client_secret_basic = 'client_secret_basic',
  post = 'post',
  client_secret_post = 'client_secret_post',
  client_secret_jwt = 'client_secret_jwt',
  private_key_jwt = 'private_key_jwt',
  none = 'none',
}

export enum IAuthorizationGrantType {
  authorization_code = 'authorization_code',
}

export enum IUserInfoAuthenticationMethod {
  header = 'header',
  form = 'form',
  query = 'query',
}

export interface ISSO_OAUTH2_CONFIG {
  registrationId: string;
  clientId: string;
  secret: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUrl: string;
  jwkSetUri?: string;
  logoutUrl?: string;
  clientAuthenticationMethod: IClientAuthenticationMethod;
  authorizationGrantType: IAuthorizationGrantType;
  userInfoAuthenticationMethod: IUserInfoAuthenticationMethod;
  nestedAttributeField?: string;
}

export interface ISSO_OIDC_CONFIG {
  registrationId: string;
  clientId: string;
  secret: string;
  scope: string[];
  issueUrl: string;
  redirectUrl: string;
}

export interface ISSO_MAPPINGRULE {
  userNickNameField: string;
  userProfileViewType: 'FLAT' | 'NESTED';
  userAccountNameField: string;
  extraInfo?: {
    attributeName: string;
    expression: string;
  }[];
}
export type ISSOConfig =
  | {
      name: string;
      type: ISSOType.OAUTH2;
      ssoParameter: ISSO_OAUTH2_CONFIG;
      mappingRule: ISSO_MAPPINGRULE;
    }
  | {
      name: string;
      type: ISSOType.OIDC;
      ssoParameter: ISSO_OIDC_CONFIG;
      mappingRule: ISSO_MAPPINGRULE;
    };

export interface IFormatPLSchema {
  plName?: string;
  plType: PLType;
  packageName?: string;
  ddl?: string;
  params?: IPLParam[];
  function?: IFunction;
  procedure?: IProcedure;
}

export interface IPLOutParam extends IPLParam {
  value: string;
}
export interface IPLExecResult {
  status: 'FAIL' | 'SUCCESS' | '';
  errorMessage?: string;
  dbms?: {
    line: string;
  };
  returnValue?: IPLOutParam;
  outParams?: IPLOutParam[];
}
export interface IPLCompileResult {
  messages: string;
  statementWarnings: string;
  status: boolean;
  track: string;
}
export interface INlsObject {
  /**
   * 格式化后的数据
   */
  formattedContent: string;
  /**
   * 时区信息
   */
  timeZoneId: string;
  /**
   * 纳秒值
   */
  nano: number;
  /**
   * 时间戳
   */
  timestamp: number;
}
