import request from '@/util/request';
import {
  generateFunctionSid,
  generatePackageSid,
  generateProcedureSid,
  generateTriggerSid,
  generateTypeSid,
} from './pathUtil';

export async function getProcedureByProName(proName: string, ignoreError?: boolean) {
  const sid = generateProcedureSid(proName);
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

export async function getFunctionByFuncName(funcName: string, ignoreError?: boolean) {
  const sid = generateFunctionSid(funcName);
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

// 获取触发器详情
export async function getTriggerByName(triggerName: string) {
  const sid = generateTriggerSid(triggerName);
  const { data: trigger } = await request.get(`/api/v1/trigger/${sid}`);

  return trigger;
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
