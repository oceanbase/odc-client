import { PLType } from '@/constant/plType';
import { IFunction, IProcedure } from '@/d.ts';
import { IDebugContext } from '@/store/debug/type';
import SessionStore from '@/store/sessionManager/session';
import request from '@/util/request';
import { generateDatabaseSid } from './pathUtil';

export async function createDebugSession(
  packageName: string,
  plSchema: IFunction | IProcedure | null,
  plType: PLType,
  content: string,
  session: SessionStore,
): Promise<string> {
  const reqParams: any = {
    sid: generateDatabaseSid(session?.database?.dbName, session?.sessionId),
    debugType: plType,
  };
  switch (plType) {
    case PLType.FUNCTION: {
      reqParams.function = plSchema;
      break;
    }
    case PLType.PROCEDURE: {
      reqParams.procedure = plSchema;
      break;
    }
    case PLType.ANONYMOUSBLOCK: {
      reqParams.anonymousBlock = content;
      break;
    }
    default: {
      throw new Error('not support debug type');
    }
  }

  const res = await request.post(`/api/v2/pldebug/sessions/`, {
    data: reqParams,
  });
  return res?.data;
}

export async function disposeDebugSession(debugId: string): Promise<boolean> {
  const res = await request.delete(`/api/v2/pldebug/sessions/${debugId}`);
  return res?.data;
}

export async function addBreakpoints(
  debugId: string,
  points: {
    plType: PLType;
    plName: string;
    packageName: string;
    line: number;
  }[],
) {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/breakpoints/batchCreate`, {
    data: points.map((point) => {
      return {
        lineNum: point.line,
        objectName: point.plName,
        objectType: point.plType,
        packageName: point.packageName,
      };
    }),
  });

  return res?.data;
}

export async function removeBreakpoints(
  debugId: string,
  points: {
    plType: PLType;
    plName: string;
    packageName: string;
    line: number;
    breakpointNum: number;
  }[],
): Promise<boolean> {
  const res = await request.delete(`/api/v2/pldebug/sessions/${debugId}/breakpoints/batchDelete`, {
    data: points.map((p) => {
      return {
        lineNum: p.line,
        objectName: p.plName,
        objectType: p.plType,
        packageName: p.packageName,
        breakpointNum: p.breakpointNum,
      };
    }),
  });

  return res?.data;
}

export async function executeResume(debugId: string): Promise<boolean> {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/resume`);
  return res?.data;
}

export async function executeStepOver(debugId: string): Promise<boolean> {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/stepOver`);
  return res?.data;
}

export async function executeStepIn(debugId: string): Promise<boolean> {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/stepIn`);
  return res?.data;
}

export async function executeStepOut(debugId: string): Promise<boolean> {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/stepOut`);
  return res?.data;
}

export async function executeResumeIgnoreBreakpoints(debugId: string): Promise<boolean> {
  const res = await request.post(`/api/v2/pldebug/sessions/${debugId}/resumeIgnoreBreakpoints`);
  return res?.data;
}

export async function getDebugContext(debugId: string): Promise<IDebugContext> {
  const res = await request.get(`/api/v2/pldebug/sessions/${debugId}/context`);
  return res?.data;
}
