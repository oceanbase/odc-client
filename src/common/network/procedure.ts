import request from '@/util/request';
import {
  generateFunctionSid,
  generatePackageSid,
  generateProcedureSid,
  generateTypeSid,
} from './pathUtil';

export async function getProcedureByProName(
  proName: string,
  ignoreError?: boolean,
  sessionId?: string,
  dbName?: string,
) {
  const sid = generateProcedureSid(proName, sessionId, dbName);
  const { data: procedure } = await request.get(`/api/v1/procedure/${sid}`, {
    params: {
      ignoreError,
    },
  });
  if (procedure) {
    procedure.params?.forEach((p) => {
      p.originDefaultValue = p.defaultValue;
    });
  }
  return procedure;
}

export async function getFunctionByFuncName(
  funcName: string,
  ignoreError?: boolean,
  sessionId?: string,
  dbName?: string,
) {
  const sid = generateFunctionSid(funcName, sessionId, dbName);
  const { data: func } = await request.get(`/api/v1/function/${sid}`, {
    params: {
      ignoreError,
    },
  });
  if (func) {
    func.params?.forEach((p) => {
      p.originDefaultValue = p.defaultValue;
    });
  }
  return func;
}

// 获取类型详情
export async function getTypemByName(typeName: string) {
  const sid = generateTypeSid(typeName);
  const { data: type } = await request.get(`/api/v1/type/${sid}`);
  return type;
}

export async function getPackageCreateSQL(
  packageName: string,
  sessionId: string,
  dbName: string,
): Promise<string> {
  const sid = generatePackageSid(packageName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/package/getCreateSql/${sid}`, {
    data: {
      packageName,
      packageType: 'package',
    },
  });
  return ret?.data?.sql;
}

export async function deleteProcedure(funName: string, sessionId: string, dbName: string) {
  const sid = generateProcedureSid(funName, sessionId, dbName);
  await request.delete(`/api/v1/procedure/${sid}`);
}

export async function getPackageBodyCreateSQL(
  packageName: string,
  sessionId: string,
  dbName: string,
): Promise<string> {
  const sid = generatePackageSid(packageName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/package/getCreateSql/${sid}`, {
    data: {
      packageName,
      packageType: 'packageBody',
    },
  });
  return ret?.data?.sql;
}

export async function deletePackage(
  packageName: string,
  sessionId: string,
  dbName: string,
): Promise<boolean> {
  const sid = generatePackageSid(packageName, sessionId, dbName);
  const result = await request.delete(`/api/v1/package/${sid}`);
  return !!result?.data;
}

export async function deletePackageBody(
  packageName: string,
  sessionId: string,
  dbName: string,
): Promise<boolean> {
  const sid = generatePackageSid(packageName, sessionId, dbName);
  const result = await request.delete(`/api/v1/package/deletePackageBody/${sid}`);
  return !!result?.data;
}
