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
