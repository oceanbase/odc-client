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
 * 统一构建page params
 */
import plType, { PLType } from '@/constant/plType';
import { IScriptMeta } from '@/d.ts';
import { SQLPage } from './pages';

export interface IPLPageParams extends Partial<IScriptMeta> {
  packageName?: string;
  scriptText: string;
  scriptName?: string;
  scriptId?: string;
  plSchema: Record<string, any>;
  isAnonymous?: boolean;
  plType?: PLType;
  plName?: string;
  fromPackage?: boolean;
  triggerName?: string;
  typeName?: string;
  cid: number;
  dbName: string;
}

export type ISQLPageParams = SQLPage['pageParams'];

export function createPackageHeadPageParams(packageName: string, sql: string, scriptId?: string) {
  return {
    packageName: packageName,
    scriptText: sql,
    scriptId,
    plSchema: {
      packageName,
      plName: `${packageName}.head`,
      plType: plType.PKG_HEAD,
    },
  };
}

export function createPackageBodyPageParams(packageName: string, sql: string, scriptId?: string) {
  return {
    packageName: packageName,
    scriptText: sql,
    scriptId,
    plSchema: {
      packageName,
      plName: `${packageName}.body`,
      plType: plType.PKG_BODY,
    },
  };
}
