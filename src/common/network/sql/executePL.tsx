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
import { generateSessionSid } from '../pathUtil';
import request from '@/util/request';

type params =
  | {
      type: PLType.PROCEDURE;
      procedure: IProcedure;
      anonymousBlockDdl: string;
    }
  | {
      type: PLType.FUNCTION;
      function: IFunction;
      anonymousBlockDdl: string;
    };

export async function executePL(parmas: params, sessionId: string, ignoreError: boolean = false) {
  let createTask: string, fetchResult: string, data: Record<string, any>;
  const sid = generateSessionSid(sessionId);
  switch (parmas.type) {
    case PLType.PROCEDURE: {
      createTask = `/api/v2/pl/procedure/${sid}/asyncCall`;
      fetchResult = `/api/v2/pl/procedure/${sid}/getResult`;
      data = {
        procedure: parmas.procedure,
        anonymousBlockDdl: parmas.anonymousBlockDdl,
      };
      break;
    }
    case PLType.FUNCTION: {
      createTask = `/api/v2/pl/function/${sid}/asyncCall`;
      fetchResult = `/api/v2/pl/function/${sid}/getResult`;
      data = {
        function: parmas.function,
        anonymousBlockDdl: parmas.anonymousBlockDdl,
      };
      break;
    }
  }
  async function loopStatus(resultId: string) {
    const taskResponse = await request.get(
      fetchResult,
      {
        params: {
          resultId,
        },
      },
      { ignoreError },
    );
    const taskResult = taskResponse?.data;
    if (taskResponse?.isError || taskResult) {
      return taskResponse;
    }
    return await loopStatus(resultId);
  }

  const res = await request.post(
    createTask,
    { data },
    {
      ignoreError,
    },
  );
  const resultId: string = res?.data;
  if (!resultId) {
    return res;
  }
  return await loopStatus(resultId);
}
