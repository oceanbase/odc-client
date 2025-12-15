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

/**
 * 后端的API需要的path
 */
import { ConnectionPropertyType } from '@/d.ts/datasource';
import { encodeObjName } from '@/util/data/string';

export function generateDatabaseSid(databaseName: string = '', sessionId?: string): string {
  return `sid:${sessionId}:d:${encodeObjName(databaseName)}`;
}
export function generateDatabaseSidByDataBaseId(databaseId: number, sessionId?: string): string {
  return `sid:${sessionId}:did:${databaseId}`;
}
export function generateSessionSid(sessionId?: string): string {
  return `sid:${sessionId}`;
}

export function generateTableSid(
  tableName: string,
  databaseName: string = '',
  sessionId?: string,
): string {
  return `${generateDatabaseSid(databaseName, sessionId)}:t:${encodeObjName(tableName)}`;
}

export function generateViewSid(
  viewName: string,
  databaseName: string = '',
  sessionId: string,
): string {
  return `${generateDatabaseSid(databaseName, sessionId)}:v:${encodeObjName(viewName)}`;
}

export function generateFunctionSid(funName: string, sessionId?: string, dbName?: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:f:${encodeObjName(funName)}`;
}

export function generateProcedureSid(pName: string, sessionId?: string, dbName?: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:p:${encodeObjName(pName)}`;
}

export function generateSequenceSid(sName: string, sessionId: string, dbName: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:s:${encodeObjName(sName)}`;
}

export function generatePackageSid(paName: string, sessionId?: string, dbName?: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:pkg:${encodeObjName(paName)}`;
}

export function generateTriggerSid(triggerName: string, sessionId: string, dbName: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:tr:${encodeObjName(triggerName)}`;
}

export function generateSynonymSid(
  synonymName: string,
  sessionId?: string,
  dbName?: string,
): string {
  return `${generateDatabaseSid(dbName, sessionId)}:syn:${encodeObjName(synonymName)}`;
}

export function generateTypeSid(typeName: string, sessionId: string, dbName: string): string {
  return `${generateDatabaseSid(dbName, sessionId)}:ty:${encodeObjName(typeName)}`;
}

export function generateVarSid(type: ConnectionPropertyType, sessionId?: string): string {
  return `${generateDatabaseSid('', sessionId)}:var:${type}`;
}
