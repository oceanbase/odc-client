import { IConnection } from '.';

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

export type IDatasource = IConnection;
