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

import { IConnection } from '.';

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

export enum ConnectionPropertyType {
  GLOBAL = 'global',
  SESSION = 'session',
}

export enum IDataSourceType {
  OceanBase = 'ob',
  MySQL = 'mysql',
}
