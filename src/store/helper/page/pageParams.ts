/**
 * 统一构建page params
 */
import plType from '@/constant/plType';

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
