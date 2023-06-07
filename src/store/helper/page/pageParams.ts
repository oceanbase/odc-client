/**
 * 统一构建page params
 */
import plType, { PLType } from '@/constant/plType';
import { IScriptMeta } from '@/d.ts';

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
  databaseFrom: 'datasource' | 'project';
}

export interface ISQLPageParams extends Partial<IScriptMeta> {
  scriptText: string;
  scriptName?: string;
  scriptId?: string;
  fromTask?: boolean;
  cid: number;
  dbName: string;
  databaseFrom: 'datasource' | 'project';
}

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
