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

export enum SpaceType {
  // 协同
  SYNERGY = 'TEAM',
  // 个人
  PRIVATE = 'INDIVIDUAL',
}

export enum IPageType {
  // 旧的
  Connection = 'connection',
  History = 'history',
  // Task = 'task',
  // 新的
  Project = 'project',
  Project_Database = 'database',
  Project_User = 'user',
  Project_Setting = 'setting',
  Project_Task = 'task',
  Datasource = 'datasource',
  Datasource_info = 'info',
  Datasource_session = 'session',
  Datasource_recycle = 'recycle',
  Datasource_obclient = 'obclient',
  Task = 'task',
  Auth = 'auth',
  Auth_User = 'user',
  Auth_Role = 'role',
  Auth_Autoauth = 'autoauth',
  Secure = 'secure',
  Secure_Env = 'env',
  Secure_Approval = 'approval',
  Secure_Record = 'record',
  RiskDetectRules = 'riskDetectRules',
  RiskLevel = 'riskLevel',
  Sensitive = 'sensitive',
  MaskingAlgorithm = 'maskingAlgorithm',
  ExternalIntegration = 'externalIntegration',
  ExternalIntegration_Approval = 'approval',
  ExternalIntegration_Sql = 'sql',
  ExternalIntegration_SSO = 'sso',
}
