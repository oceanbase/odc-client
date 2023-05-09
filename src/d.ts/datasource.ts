export enum DialectType {
  MYSQL = 'MYSQL',
  ORACLE = 'ORACLE',
  OB_MYSQL = 'OB_MYSQL',
  OB_ORACLE = 'OB_ORACLE',
  CLOUD_OB_MYSQL = 'CLOUD_OB_MYSQL',
  CLOUD_OB_ORACLE = 'CLOUD_OB_ORACLE',
  ODP_SHARDING_OB_MYSQL = 'ODP_SHARDING_OB_MYSQL',
  ODP_SHARDING_OB_ORACLE = 'ODP_SHARDING_OB_ORACLE',
  UNKNOWN = 'UNKNOWN',
}

export enum IConnectionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  NOPASSWORD = 'NOPASSWORD',
  DISABLED = 'DISABLED',
  UNKNOWN = 'UNKNOWN',
}

export enum Cipher {
  RAW = 'RAW',
  BCRYPT = 'BCRYPT',
  AES256SALT = 'AES256SALT',
}

export enum AccessMode {
  DIRECT = 'DIRECT',
  IC_PROXY = 'IC_PROXY',
  VPC = 'VPC',
}

export interface IDatasource {
  id: number; // sid
  name: string; // 连接名称，sessionName
  type: DialectType;
  host: string; // 主机，公有云连接格式为 {domain}:{port}
  port: number; // 端口，公有云连接不需要设置 port
  username: string; // 数据库登录用户名，dbUser
  password: string; // 连接密码，null 表示不设置，空字符串表示空密码，当 passwordSaved=true 时，不能为 null
  clusterName: string; // OceanBase 集群称，cluster 公有云连接不需要设置
  tenantName: string; // OceanBase 租户名称，tenant 公有云连接不需要设置
  enabled: boolean;
  status: {
    args: string[];
    errorCode: unknown;
    status: IConnectionStatus;
    type: DialectType;
    nextCheckTimeMillis: number;
    lastAccessTimeMillis: number;
  };
  environmentId: number;
  environmentName: string;
  passwordEncrypted: string; // 加密后的密码，调用端忽略此字段
  sysTenantUsername: string; // 系统租户账号用户名称
  sysTenantPassword: string; // 系统租户账号密码
  sysTenantPasswordEncrypted: string; // 加密后的密码，调用端忽略此字段
  cipher: Cipher;
  salt: string;
  // 连接 Endpoint
  endpoint: {
    accessMode: AccessMode; // 连接模式，详见 {@link OceanBaseAccessMode}
    host: string; // 租户连接 Host，目标 OceanBase 租户的实际连接 Host，保留字段暂未使用
    port: number; // 租户连接 Port，目标 OceanBase 租户的实际连接端口，保留字段暂未使用
    proxyHost: string; // 代理服务 Host， 即 IC-Server 地址，配置到 JDBC url socksProxyHost 参数，多云适用
    proxyPort: number; // 代理服务 端口， 即 IC-Server 端口，配置到 JDBC url socksProxyPort 参数，多云适用
    virtualHost: string; // 虚拟 Host，通过代理服务访问的目标 Host，代替直连模式的 host，多云和阿里云公有云适用
    virtualPort: number; // 虚拟 Port，通过代理服务访问的目标 Port，代替直连模式 port，多云和阿里云公有云适用
  };
  // SSL 安全设置
  sslConfig: {
    enabled: boolean; // 是否开启 SSL 连接，为 false 时，下面的配置项无效，表示非 SSL 连接
    clientCertObjectId?: string; // 客户端证书 objectId
    clientKeyObjectId?: string; // 客户端密钥 objectId
    CACertObjectId?: string; // CA 证书 objectId
  };
  sslFileEntry: {
    keyStoreFilePath: string;
    keyStoreFilePassword: string;
  };
  organizationId: number;
  properties: any; // Extend properties
}
