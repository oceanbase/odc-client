import { IProcedure } from '@/d.ts';
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
export async function getTypemByName(typeName: string, sessionId: string, dbName: string) {
  const sid = generateTypeSid(typeName, sessionId, dbName);
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

export async function getPackage(pkgName: string, sessionId: string, dbName: string) {
  const sid = generatePackageSid(pkgName, sessionId, dbName);
  const res = await request.get(`/api/v1/package/${sid}`);
  const data = res?.data;
  const packageName = data?.packageName;
  if (data) {
    function addKey(target, paramName) {
      const keyMap = {};
      target[paramName] = target[paramName]
        ?.map((obj) => {
          const { params, returnType, proName, funName } = obj;
          const name = proName || funName;
          const key = btoa(
            encodeURIComponent(
              params
                ?.map((p) => {
                  return p.paramName + ':' + p.dataType;
                })
                ?.join('$@p@$') +
                '$@' +
                returnType,
            ),
          );
          const uniqKey = packageName + '.' + name + '*' + key;
          if (keyMap[uniqKey]) {
            /**
             * 去除完全一致的子程序
             */
            return null;
          }
          keyMap[uniqKey] = key;
          return {
            ...obj,
            params: params?.map((param) =>
              Object.assign({}, param, {
                originDefaultValue: param.defaultValue,
              }),
            ),
            key: uniqKey,
          };
        })
        .filter(Boolean);
    }
    const pkgBody = data.packageBody;
    const pkgHead = data.packageHead;
    if (pkgBody) {
      addKey(pkgBody, 'functions');
      addKey(pkgBody, 'procedures');
    }
    if (pkgHead) {
      addKey(pkgHead, 'functions');
      addKey(pkgHead, 'procedures');
    }
  }
  return data;
}

export async function getProcedureCreateSQL(
  funName: string,
  func: Partial<IProcedure>,
  sessionId: string,
  dbName: string,
) {
  const sid = generateProcedureSid(funName, sessionId, dbName);
  const ret = await request.patch(`/api/v1/procedure/getCreateSql/${sid}`, {
    data: func,
  });
  return ret?.data?.sql;
}
