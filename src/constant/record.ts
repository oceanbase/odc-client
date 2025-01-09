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

import { AuditEventActionType, AuditEventType, IAuditEvent } from '@/d.ts';
import { formatMessage } from '@/util/intl';
export interface IUserMap {
  [key: string]: {
    name: string;
    accountName: string;
    roleNames?: string[];
  };
}
export const AuditEventMetaMap = {
  [AuditEventType.PERSONAL_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.PersonalSettings',
    defaultMessage: '个人设置',
  }),
  //个人设置
  [AuditEventType.MEMBER_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.MemberManagement',
    defaultMessage: '成员管理',
  }),
  //成员管理
  [AuditEventType.PASSWORD_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.PasswordManagement',
    defaultMessage: '密码管理',
  }),
  //密码管理
  [AuditEventType.CONNECTION_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ConnectionManagement',
    defaultMessage: '连接管理',
  }),
  //连接管理
  [AuditEventType.SCRIPT_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ScriptManagement',
    defaultMessage: '脚本管理',
  }),
  //脚本管理
  [AuditEventType.DATABASE_OPERATION]: formatMessage({
    id: 'odc.components.RecordPage.DatabaseOperations',
    defaultMessage: '数据库操作',
  }),
  //数据库操作
  [AuditEventType.ORGANIZATION_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.OrganizationConfiguration',
    defaultMessage: '组织配置',
  }),
  //组织配置
  [AuditEventType.RESOURCE_GROUP_MANAGEMENT]: formatMessage({
    id: 'odc.components.RecordPage.ResourceGroupManagement',
    defaultMessage: '资源组管理',
  }),
  //资源组管理
  [AuditEventType.ASYNC]: formatMessage({
    id: 'odc.components.RecordPage.DatabaseChanges',
    defaultMessage: '数据库变更',
  }),
  //数据库变更
  [AuditEventType.IMPORT]: formatMessage({
    id: 'odc.components.RecordPage.Import',
    defaultMessage: '导入',
  }),
  //导入
  [AuditEventType.EXPORT]: formatMessage({
    id: 'odc.components.RecordPage.Export',
    defaultMessage: '导出',
  }),
  //导出
  [AuditEventType.MOCKDATA]: formatMessage({
    id: 'odc.components.RecordPage.AnalogData',
    defaultMessage: '模拟数据',
  }),
  //模拟数据
  [AuditEventType.AUDIT_EVENT]: formatMessage({
    id: 'odc.components.RecordPage.OperationRecords',
    defaultMessage: '操作记录',
  }),
  [AuditEventType.SHADOWTABLE_SYNC]: formatMessage({
    id: 'odc.components.RecordPage.ShadowTableSynchronization',
    defaultMessage: '影子表同步',
  }),
  //影子表同步
  [AuditEventType.STRUCTURE_COMPARISON]: formatMessage({
    id: 'src.constant.C180952A',
    defaultMessage: '结构比对',
  }), //'结构比对'
  [AuditEventType.PARTITION_PLAN]: formatMessage({
    id: 'odc.components.RecordPage.PartitionPlan',
    defaultMessage: '分区计划',
  }),
  //分区计划 //操作记录
  [AuditEventType.FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.TaskFlow',
    defaultMessage: '任务流程',
  }),
  //任务流程
  [AuditEventType.DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.DesensitizationRules',
    defaultMessage: '脱敏规则',
  }),
  //脱敏规则
  [AuditEventType.DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.DesensitizationStrategy',
    defaultMessage: '脱敏策略',
  }),
  //脱敏策略
  [AuditEventType.ALTER_SCHEDULE]: formatMessage({
    id: 'odc.components.RecordPage.PlannedChange',
    defaultMessage: '计划变更',
  }),
  //计划变更

  // 数据库管理
  [AuditEventType.DATABASE_MANAGEMENT]: formatMessage({
    id: 'odc.Record.RecordPage.interface.DatabaseManagement',
    defaultMessage: '数据库管理',
  }),
  //数据库管理
  // 权限申请
  [AuditEventType.PERMISSION_APPLY]: formatMessage({
    id: 'odc.Record.RecordPage.interface.PermissionApplication',
    defaultMessage: '权限申请',
  }),
  //权限申请
  // 数据源管理
  [AuditEventType.DATASOURCE_MANAGEMENT]: formatMessage({
    id: 'odc.Record.RecordPage.interface.DataSourceManagement',
    defaultMessage: '数据源管理',
  }),
  //数据源管理
  // 项目管理
  [AuditEventType.PROJECT_MANAGEMENT]: formatMessage({
    id: 'odc.Record.RecordPage.interface.ProjectManagement',
    defaultMessage: '项目管理',
  }),
  //项目管理
  // 审计事件
  [AuditEventType.EXPORT_RESULT_SET]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.ExportResultSet',
    defaultMessage: '导出结果集',
  }),
  //'导出结果集'
  // 申请项目权限
  [AuditEventActionType.APPLY_PROJECT_PERMISSION]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.ApplicationProjectPermissions',
    defaultMessage: '申请项目权限',
  }), //'申请项目权限'
  // SQL安全规则管理
  [AuditEventType.SQL_SECURITY_RULE_MANAGEMENT]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.SQLSecurityRulesManagement',
    defaultMessage: 'SQL 安全规则管理',
  }), //'SQL安全规则管理'
  [AuditEventActionType.APPLY_DATABASE_PERMISSION]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.A6ED266B',
    defaultMessage: '申请库权限',
  }), //'申请库权限'
  [AuditEventActionType.DATABASE_PERMISSION_MANAGEMENT]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.5B4CDCAF',
    defaultMessage: '库权限管理',
  }), //'库权限管理'
  [AuditEventActionType.APPLY_TABLE_PERMISSION]: formatMessage({
    id: 'src.constant.CFB6ECD2',
    defaultMessage: '申请表/视图权限',
  }),
  [AuditEventActionType.TABLE_PERMISSION_MANAGEMENT]: formatMessage({
    id: 'src.constant.C3495416',
    defaultMessage: '表/视图权限管理',
  }),
  [AuditEventType.AUTOMATION_RULE_MANAGEMENT]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.B7B36187',
    defaultMessage: '自动授权规则管理',
  }), //'自动授权规则管理'
  [AuditEventType.NOTIFICATION_MANAGEMENT]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.28E26C1D',
    defaultMessage: '消息推送管理',
  }), //'消息推送管理'
  [AuditEventType.SENSITIVE_COLUMN_MANAGEMENT]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.10FC55A9',
    defaultMessage: '敏感列管理',
  }), //'敏感列管理'
  [AuditEventType.MULTIPLE_ASYNC]: formatMessage({
    id: 'src.constant.B8039A65',
    defaultMessage: '多库变更',
  }),
  [AuditEventType.DATABASE_CHANGE_CHANGING_ORDER_TEMPLATE_MANAGEMENT]: formatMessage({
    id: 'src.constant.6161DC9D',
    defaultMessage: '数据库变更顺序模板管理',
  }),
};
export const AuditEventActionMap = {
  // 个人配置
  [AuditEventActionType.UPDATE_PERSONAL_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
    defaultMessage: '修改',
  }),
  // 密码管理
  // 修改密码
  [AuditEventActionType.CHANGE_PASSWORD]: formatMessage({
    id: 'odc.components.RecordPage.ChangePassword',
    defaultMessage: '修改密码',
  }),
  // 重置密码
  [AuditEventActionType.RESET_PASSWORD]: formatMessage({
    id: 'odc.Record.RecordPage.interface.ResetPassword',
    defaultMessage: '重置密码',
  }),
  //重置密码
  // 设置密码
  [AuditEventActionType.SET_PASSWORD]: formatMessage({
    id: 'odc.components.RecordPage.SetPassword',
    defaultMessage: '设置密码',
  }),
  // 连接管理
  [AuditEventActionType.CREATE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CreateConnection',
    defaultMessage: '新建连接',
  }),
  //新建连接
  [AuditEventActionType.DELETE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAConnection',
    defaultMessage: '删除连接',
  }),
  //删除连接
  [AuditEventActionType.UPDATE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.ModifyAConnection',
    defaultMessage: '修改连接',
  }),
  //修改连接
  [AuditEventActionType.USE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CreateASession',
    defaultMessage: '创建会话',
  }),
  //创建会话
  [AuditEventActionType.QUIT_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.CloseSession',
    defaultMessage: '关闭会话',
  }),
  //关闭会话
  [AuditEventActionType.ENABLE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.Enable',
    defaultMessage: '启用',
  }),
  //启用
  [AuditEventActionType.DISABLE_CONNECTION]: formatMessage({
    id: 'odc.components.RecordPage.Disable',
    defaultMessage: '停用',
  }),
  //停用 // 脚本管理
  [AuditEventActionType.CREATE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.UPDATE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
    defaultMessage: '修改',
  }),
  //修改
  [AuditEventActionType.DELETE_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
    defaultMessage: '删除',
  }),
  //删除
  [AuditEventActionType.DOWNLOAD_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Download',
    defaultMessage: '下载',
  }),
  //下载
  [AuditEventActionType.UPLOAD_SCRIPT]: formatMessage({
    id: 'odc.components.RecordPage.Upload',
    defaultMessage: '上传',
  }),
  //上传 // 组织配置
  [AuditEventActionType.UPDATE_ORGANIZATION_CONFIGURATION]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
    defaultMessage: '修改',
  }),
  //修改 // 成员管理
  [AuditEventActionType.ADD_USER]: formatMessage({
    id: 'odc.components.RecordPage.AddUser',
    defaultMessage: '新增用户',
  }),
  //新增用户
  [AuditEventActionType.UPDATE_USER]: formatMessage({
    id: 'odc.components.RecordPage.ModifyUser',
    defaultMessage: '修改用户',
  }),
  //修改用户
  [AuditEventActionType.DELETE_USER]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAUser',
    defaultMessage: '删除用户',
  }),
  //删除用户
  [AuditEventActionType.ADD_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.AddRole',
    defaultMessage: '新增角色',
  }),
  //新增角色
  [AuditEventActionType.UPDATE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.ModifyARole',
    defaultMessage: '修改角色',
  }),
  //修改角色
  [AuditEventActionType.DELETE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.DeleteARole',
    defaultMessage: '删除角色',
  }),
  //删除角色
  [AuditEventActionType.ENABLE_USER]: formatMessage({
    id: 'odc.components.RecordPage.EnableUsers',
    defaultMessage: '启用用户',
  }),
  //启用用户
  [AuditEventActionType.DISABLE_USER]: formatMessage({
    id: 'odc.components.RecordPage.DisableUser',
    defaultMessage: '停用用户',
  }),
  //停用用户
  [AuditEventActionType.ENABLE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.EnableRole',
    defaultMessage: '启用角色',
  }),
  //启用角色
  [AuditEventActionType.DISABLE_ROLE]: formatMessage({
    id: 'odc.components.RecordPage.DisableARole',
    defaultMessage: '停用角色',
  }),
  //停用角色 // 资源组管理
  [AuditEventActionType.ADD_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.AddResourceGroup',
    defaultMessage: '新增资源组',
  }),
  //新增资源组
  [AuditEventActionType.UPDATE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.ModifyAResourceGroup',
    defaultMessage: '修改资源组',
  }),
  //修改资源组
  [AuditEventActionType.DELETE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.DeleteAResourceGroup',
    defaultMessage: '删除资源组',
  }),
  //删除资源组
  [AuditEventActionType.ENABLE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.EnableResourceGroups',
    defaultMessage: '启用资源组',
  }),
  //启用资源组
  [AuditEventActionType.DISABLE_RESOURCE_GROUP]: formatMessage({
    id: 'odc.components.RecordPage.DisableAResourceGroup',
    defaultMessage: '停用资源组',
  }),
  //停用资源组 // 数据库操作
  [AuditEventActionType.SELECT]: 'SELECT',
  [AuditEventActionType.DELETE]: 'DELETE',
  [AuditEventActionType.INSERT]: 'INSERT',
  [AuditEventActionType.REPLACE]: 'REPLACE',
  [AuditEventActionType.UPDATE]: 'UPDATE',
  [AuditEventActionType.SET]: 'SET',
  [AuditEventActionType.DROP]: 'DROP',
  [AuditEventActionType.ALTER]: 'ALTER',
  [AuditEventActionType.TRUNCATE]: 'TRUNCATE',
  [AuditEventActionType.CREATE]: 'CREATE',
  [AuditEventActionType.OTHERS]: 'OTHERS',
  // 任务流程
  [AuditEventActionType.CREATE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.CREATE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.CREATE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.CREATE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.APPROVE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.APPROVE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.APPROVE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.APPROVE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.REJECT_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.REJECT_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.REJECT_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.REJECT_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.EXECUTE_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.EXECUTE_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.EXECUTE_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.EXECUTE_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Run',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.STOP_ASYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
    defaultMessage: '终止',
  }),
  //终止
  [AuditEventActionType.STOP_MOCKDATA_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
    defaultMessage: '终止',
  }),
  //终止
  [AuditEventActionType.STOP_IMPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
    defaultMessage: '终止',
  }),
  //终止
  [AuditEventActionType.STOP_EXPORT_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Terminate',
    defaultMessage: '终止',
  }),
  //终止
  [AuditEventActionType.ROLLBACK_TASK]: formatMessage({
    id: 'odc.components.RecordPage.RollBack',
    defaultMessage: '回滚',
  }),
  //拒绝 //回滚 // 操作记录
  [AuditEventActionType.EXPORT_AUDIT_EVENT]: formatMessage({
    id: 'odc.components.RecordPage.ExportOperationRecords',
    defaultMessage: '导出操作记录',
  }),
  //导出操作记录 // 流程管理
  [AuditEventActionType.CREATE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.CreateProcess',
    defaultMessage: '新建流程',
  }),
  //新建流程
  [AuditEventActionType.UPDATE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.ChangeProcess',
    defaultMessage: '修改流程',
  }),
  //修改流程
  [AuditEventActionType.ENABLE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.Process',
    defaultMessage: '启用流程',
  }),
  //启用流程
  [AuditEventActionType.DISABLE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.DeactivateProcess',
    defaultMessage: '停用流程',
  }),
  //停用流程
  [AuditEventActionType.DELETE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.DeleteProcess',
    defaultMessage: '删除流程',
  }),
  //删除流程
  [AuditEventActionType.BATCH_DELETE_FLOW_CONFIG]: formatMessage({
    id: 'odc.components.RecordPage.BatchDelete',
    defaultMessage: '批量删除',
  }),
  //批量删除
  [AuditEventActionType.CREATE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.UPDATE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
    defaultMessage: '修改',
  }),
  //修改
  [AuditEventActionType.ENABLE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Enable',
    defaultMessage: '启用',
  }),
  //启用
  [AuditEventActionType.DISABLE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Disable',
    defaultMessage: '停用',
  }),
  //停用
  [AuditEventActionType.DELETE_DATA_MASKING_RULE]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
    defaultMessage: '删除',
  }),
  //删除
  [AuditEventActionType.CREATE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.UPDATE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Modify',
    defaultMessage: '修改',
  }),
  //修改
  [AuditEventActionType.DELETE_DATA_MASKING_POLICY]: formatMessage({
    id: 'odc.components.RecordPage.Delete',
    defaultMessage: '删除',
  }),
  //删除

  [AuditEventActionType.CREATE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.EXECUTE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.APPROVE_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.REJECT_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.STOP_SHADOWTABLE_SYNC_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
    defaultMessage: '终止',
  }),
  // //终止
  // 结构比对
  [AuditEventActionType.CREATE_STRUCTURE_COMPARISON_TASK]: formatMessage({
    id: 'src.constant.052399AE',
    defaultMessage: '创建结构比对任务',
  }), //'创建结构比对任务'
  [AuditEventActionType.STOP_STRUCTURE_COMPARISON_TASK]: formatMessage({
    id: 'src.constant.5073B3F1',
    defaultMessage: '停止结构比对任务',
  }), //'停止结构比对任务'
  [AuditEventActionType.EXECUTE_STRUCTURE_COMPARISON_TASK]: formatMessage({
    id: 'src.constant.8282AA35',
    defaultMessage: '执行结构比对任务',
  }), //'执行结构比对任务'
  [AuditEventActionType.APPROVE_STRUCTURE_COMPARISON_TASK]: formatMessage({
    id: 'src.constant.2AC9D3B7',
    defaultMessage: '同意结构比对任务',
  }), //'同意结构比对任务'
  [AuditEventActionType.REJECT_STRUCTURE_COMPARISON_TASK]: formatMessage({
    id: 'src.constant.8171D57C',
    defaultMessage: '拒绝结构比对任务',
  }), //'拒绝结构比对任务'
  [AuditEventActionType.CREATE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.EXECUTE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.APPROVE_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.REJECT_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝
  [AuditEventActionType.STOP_PARTITION_PLAN_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
    defaultMessage: '终止',
  }),
  //终止

  [AuditEventActionType.CREATE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Create',
    defaultMessage: '新建',
  }),
  //新建
  [AuditEventActionType.STOP_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Termination',
    defaultMessage: '终止',
  }),
  //终止
  [AuditEventActionType.EXECUTE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Execute',
    defaultMessage: '执行',
  }),
  //执行
  [AuditEventActionType.APPROVE_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Pass',
    defaultMessage: '通过',
  }),
  //通过
  [AuditEventActionType.REJECT_ALTER_SCHEDULE_TASK]: formatMessage({
    id: 'odc.components.RecordPage.Reject',
    defaultMessage: '拒绝',
  }),
  //拒绝

  // 数据管理事件操作
  [AuditEventActionType.ADD_DATABASE]: formatMessage({
    id: 'odc.Record.RecordPage.interface.AddDatabase',
    defaultMessage: '增加数据库',
  }),
  //增加数据库
  [AuditEventActionType.TRANSFER_DATABASE_TO_PROJECT]: formatMessage({
    id: 'odc.Record.RecordPage.interface.TransferProject',
    defaultMessage: '转移项目',
  }),
  //转移项目
  [AuditEventActionType.DELETE_DATABASE]: formatMessage({
    id: 'odc.Record.RecordPage.interface.DeleteADatabase',
    defaultMessage: '删除数据库',
  }),
  //删除数据库
  // 权限申请任务事件操作
  [AuditEventActionType.CREATE_PERMISSION_APPLY_TASK]: formatMessage({
    id: 'odc.Record.RecordPage.interface.CreateAPermissionRequestTask',
    defaultMessage: '创建权限申请任务',
  }),
  //创建权限申请任务
  [AuditEventActionType.APPROVE_PERMISSION_APPLY_TASK]: formatMessage({
    id: 'odc.Record.RecordPage.interface.PermissionRequestTask',
    defaultMessage: '同意权限申请任务',
  }),
  //同意权限申请任务
  [AuditEventActionType.REJECT_PERMISSION_APPLY_TASK]: formatMessage({
    id: 'odc.Record.RecordPage.interface.DenyPermissionRequestTask',
    defaultMessage: '拒绝权限申请任务',
  }),
  //拒绝权限申请任务
  // 数据源管理事件操作
  [AuditEventActionType.CREATE_DATASOURCE]: formatMessage({
    id: 'odc.Record.RecordPage.interface.CreateADataSource',
    defaultMessage: '创建数据源',
  }),
  //创建数据源
  [AuditEventActionType.DELETE_DATASOURCE]: formatMessage({
    id: 'odc.Record.RecordPage.interface.DeleteADataSource',
    defaultMessage: '删除数据源',
  }),
  //删除数据源
  [AuditEventActionType.UPDATE_DATASOURCE]: formatMessage({
    id: 'odc.Record.RecordPage.interface.UpdateDataSource',
    defaultMessage: '更新数据源',
  }),
  //更新数据源
  // 项目管理事件操作
  [AuditEventActionType.CREATE_PROJECT]: formatMessage({
    id: 'odc.Record.RecordPage.interface.CreateAProject',
    defaultMessage: '创建项目',
  }),
  [AuditEventActionType.ARCHIVE_PROJECT]: '归档项目',
  [AuditEventActionType.DELETE_PROJECT]: '删除项目',
  //创建项目
  // 审计事件操作
  [AuditEventActionType.CREATE_EXPORT_RESULT_SET_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.CreateTheExportResultsSet',
    defaultMessage: '创建导出结果集任务',
  }),
  //'创建导出结果集任务'
  [AuditEventActionType.APPROVE_EXPORT_RESULT_SET_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.AgreeToExportResultsSet',
    defaultMessage: '同意导出结果集任务',
  }),
  //'同意导出结果集任务'
  [AuditEventActionType.REJECT_EXPORT_RESULT_SET_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.RejectTheExportResultsSet',
    defaultMessage: '拒绝导出结果集任务',
  }),
  //'拒绝导出结果集任务'
  [AuditEventActionType.EXECUTE_EXPORT_RESULT_SET_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.ExecutionResultsSetTask',
    defaultMessage: '执行结果集任务',
  }),
  //'执行结果集任务'
  [AuditEventActionType.STOP_EXPORT_RESULT_SET_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.StopExportResultsSetTask',
    defaultMessage: '停止导出结果集任务',
  }),
  //'停止导出结果集任务'
  // 申请项目权限
  [AuditEventActionType.APPLY_PROJECT_PERMISSION]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.ApplicationProjectPermissions.1',
    defaultMessage: '申请项目权限',
  }), //'申请项目权限'
  [AuditEventActionType.CREATE_APPLY_PROJECT_PERMISSION_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.CreateApplicationProjectPermissions',
    defaultMessage: '创建申请项目权限',
  }), //'创建申请项目权限'
  [AuditEventActionType.APPROVE_APPLY_PROJECT_PERMISSION_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.AgreeToApplyForProject',
    defaultMessage: '同意申请项目权限',
  }), //'同意申请项目权限'
  [AuditEventActionType.REJECT_APPLY_PROJECT_PERMISSION_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.RefuseToApplyForProject',
    defaultMessage: '拒绝申请项目权限',
  }), //'拒绝申请项目权限'
  [AuditEventActionType.STOP_APPLY_PROJECT_PERMISSION_TASK]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.StopApplyForProjectPermissions',
    defaultMessage: '停止申请项目权限',
  }), //'停止申请项目权限'
  // SQL安全规则管理
  [AuditEventActionType.UPDATE_SQL_SECURITY_RULE]: formatMessage({
    id: 'odc.src.page.Secure.Record.RecordPage.ModifySQLSecurityRules',
    defaultMessage: '修改 SQL 安全规则',
  }), //'修改SQL安全规则'
  // 申请项目权限
  [AuditEventActionType.APPLY_DATABASE_PERMISSION]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.C96CBA29',
    defaultMessage: '申请库权限',
  }), //'申请库权限'
  [AuditEventActionType.CREATE_APPLY_DATABASE_PERMISSION_TASK]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.6EC785DD',
    defaultMessage: '创建申请库权限',
  }), //'创建申请库权限'
  [AuditEventActionType.APPROVE_APPLY_DATABASE_PERMISSION_TASK]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.5E8469B3',
    defaultMessage: '同意申请库权限',
  }), //'同意申请库权限'
  [AuditEventActionType.REJECT_APPLY_DATABASE_PERMISSION_TASK]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.D31945E0',
    defaultMessage: '拒绝申请库权限',
  }), //'拒绝申请库权限'
  [AuditEventActionType.STOP_APPLY_DATABASE_PERMISSION_TASK]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.3DB3CCDE',
    defaultMessage: '停止申请库权限',
  }), //'停止申请库权限'

  [AuditEventActionType.DATABASE_PERMISSION_MANAGEMENT]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.6F1F90F6',
    defaultMessage: '库权限管理',
  }), //'库权限管理'
  [AuditEventActionType.GRANT_DATABASE_PERMISSION]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.FE7177CE',
    defaultMessage: '新增库权限',
  }), //'新增库权限管理'
  [AuditEventActionType.REVOKE_DATABASE_PERMISSION]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.BBF6BE0C',
    defaultMessage: '回收库权限',
  }), //'回收库权限管理'
  [AuditEventActionType.APPLY_TABLE_PERMISSION]: formatMessage({
    id: 'src.constant.71D62B8C',
    defaultMessage: '申请表/视图权限',
  }),
  [AuditEventActionType.CREATE_APPLY_TABLE_PERMISSION_TASK]: formatMessage({
    id: 'src.constant.7E594AFE',
    defaultMessage: '创建申请表/视图权限',
  }),
  [AuditEventActionType.APPROVE_APPLY_TABLE_PERMISSION_TASK]: formatMessage({
    id: 'src.constant.34E5C626',
    defaultMessage: '同意申请表/视图权限',
  }),
  [AuditEventActionType.REJECT_APPLY_TABLE_PERMISSION_TASK]: formatMessage({
    id: 'src.constant.2DFACC51',
    defaultMessage: '拒绝申请表/视图权限',
  }),
  [AuditEventActionType.STOP_APPLY_TABLE_PERMISSION_TASK]: formatMessage({
    id: 'src.constant.CE89B9A5',
    defaultMessage: '停止申请表/视图权限',
  }),
  [AuditEventActionType.TABLE_PERMISSION_MANAGEMENT]: formatMessage({
    id: 'src.constant.9E69D9A7',
    defaultMessage: '表/视图权限管理',
  }),
  [AuditEventActionType.GRANT_TABLE_PERMISSION]: formatMessage({
    id: 'src.constant.072ADD11',
    defaultMessage: '新增表/视图权限管理',
  }),
  [AuditEventActionType.REVOKE_TABLE_PERMISSION]: formatMessage({
    id: 'src.constant.1A7AEA14',
    defaultMessage: '回收表/视图权限管理',
  }),
  // 自动授权规则
  [AuditEventActionType.CREATE_AUTOMATION_RULE]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.61D99657',
    defaultMessage: '创建自动授权规则',
  }), //'创建自动授权规则'
  [AuditEventActionType.ENABLE_AUTOMATION_RULE]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.835AC167',
    defaultMessage: '启用自动授权规则',
  }), //'启用自动授权规则'
  [AuditEventActionType.DISABLE_AUTOMATION_RULE]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.BE82DF97',
    defaultMessage: '禁用自动授权规则',
  }), //'禁用自动授权规则'
  [AuditEventActionType.UPDATE_AUTOMATION_RULE]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.C092DD2B',
    defaultMessage: '修改自动授权规则',
  }), //'修改自动授权规则'
  [AuditEventActionType.DELETE_AUTOMATION_RULE]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.2D2EFDF4',
    defaultMessage: '删除自动授权规则',
  }), //'删除自动授权规则'

  [AuditEventActionType.CREATE_NOTIFICATION_CHANNEL]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.8EEA2B75',
    defaultMessage: '创建推送通道',
  }), //'创建推送通道'
  [AuditEventActionType.UPDATE_NOTIFICATION_CHANNEL]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.7C5B25A6',
    defaultMessage: '修改推送通道',
  }), //'修改推送通道'
  [AuditEventActionType.DELETE_NOTIFICATION_CHANNEL]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.ABFE4553',
    defaultMessage: '删除推送通道',
  }), //'删除推送通道'
  [AuditEventActionType.BATCH_UPDATE_NOTIFICATION_POLICIES]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.031FEE2D',
    defaultMessage: '更新推送规则',
  }), //'更新推送规则'

  [AuditEventActionType.BATCH_CREATE_SENSITIVE_COLUMNS]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.9D3D3621',
    defaultMessage: '批量创建敏感列',
  }), //'批量创建敏感列'
  [AuditEventActionType.BATCH_UPDATE_SENSITIVE_COLUMNS]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.F959721C',
    defaultMessage: '批量更新敏感列',
  }), //'批量更新敏感列'
  [AuditEventActionType.BATCH_DELETE_SENSITIVE_COLUMNS]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.52BD5121',
    defaultMessage: '批量删除敏感列',
  }), //'批量删除敏感列'
  [AuditEventActionType.ENABLE_SENSITIVE_COLUMN]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.1A6954C8',
    defaultMessage: '启用敏感列',
  }), //'启用敏感列'
  [AuditEventActionType.DISABLE_SENSITIVE_COLUMN]: formatMessage({
    id: 'src.page.Secure.Record.RecordPage.3174392D',
    defaultMessage: '禁用敏感列',
  }), //'禁用敏感列'

  // #region ------ 多库变更 -----
  [AuditEventActionType.CREATE_MULTIPLE_ASYNC_TASK]: formatMessage({
    id: 'src.constant.0C73ED6E',
    defaultMessage: '创建多库变更任务',
  }),
  [AuditEventActionType.EXECUTE_MULTIPLE_ASYNC_TASK]: formatMessage({
    id: 'src.constant.FA53705B',
    defaultMessage: '执行多库变更任务',
  }),
  [AuditEventActionType.STOP_MULTIPLE_ASYNC_TASK]: formatMessage({
    id: 'src.constant.A44EAEF4',
    defaultMessage: '停止多库变更任务',
  }),
  [AuditEventActionType.APPROVE_MULTIPLE_ASYNC_TASK]: formatMessage({
    id: 'src.constant.AFC1802A',
    defaultMessage: '同意多库变更任务',
  }),
  [AuditEventActionType.REJECT_MULTIPLE_ASYNC_TASK]: formatMessage({
    id: 'src.constant.F65868B0',
    defaultMessage: '拒绝多库变更任务',
  }),
  // #endregion

  // #region ---- 多库变更模版管理 ----
  [AuditEventActionType.CREATE_DATABASE_CHANGE_CHANGING_ORDER_TEMPLATE]: formatMessage({
    id: 'src.constant.394E7917',
    defaultMessage: '创建数据库变更顺序模板\t',
  }),
  [AuditEventActionType.DELETE_DATABASE_CHANGE_CHANGING_ORDER_TEMPLATE]: formatMessage({
    id: 'src.constant.311737C9',
    defaultMessage: '删除数据库变更顺序模板\t',
  }),
  [AuditEventActionType.UPDATE_DATABASE_CHANGE_CHANGING_ORDER_TEMPLATE]: formatMessage({
    id: 'src.constant.4E522234',
    defaultMessage: '更新数据库变更顺序模板\t',
  }),
  // #endregion
};
export function getEventFilterAndOptions(eventMeta: IAuditEvent[]) {
  const metas =
    eventMeta?.reduce((meta, { type, action }) => {
      if (meta[type]) {
        meta[type].push(action);
      } else {
        meta[type] = [action];
      }
      return meta;
    }, {}) ?? {};
  const filter = [];
  const options =
    Object.keys(metas)?.map((type) => {
      const children =
        metas[type]?.map((value) => {
          return {
            title: AuditEventActionMap[value],
            key: value,
            value,
          };
        }) ?? [];
      filter.push({
        text: AuditEventMetaMap[type],
        value: type,
      });
      return {
        title: AuditEventMetaMap[type],
        key: type,
        value: type,
        children: children,
      };
    }) ?? [];
  return {
    filter,
    options,
  };
}
