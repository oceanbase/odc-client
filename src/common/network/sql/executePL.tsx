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
