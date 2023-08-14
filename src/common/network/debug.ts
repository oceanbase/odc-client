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
  anonymousBlock: string,
  session: SessionStore,
): Promise<string> {
  const reqParams: any = {
    sid: generateDatabaseSid(session?.database?.dbName, session?.sessionId),
    // 存在anonymousBlock的情况下，实际上走的是匿名块跳入的方式，所以类型是ANONYMOUSBLOCK；
    debugType: anonymousBlock ? PLType.ANONYMOUSBLOCK : plType,
  };
  switch (plType) {
    case PLType.FUNCTION: {
      reqParams.function = plSchema;
      reqParams.anonymousBlock = anonymousBlock;
      break;
    }
    case PLType.PROCEDURE: {
      reqParams.procedure = plSchema;
      reqParams.anonymousBlock = anonymousBlock;
      break;
    }
    case PLType.ANONYMOUSBLOCK: {
      reqParams.anonymousBlock = anonymousBlock;
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
