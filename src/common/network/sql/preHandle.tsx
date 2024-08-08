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

import { EStatus } from '@/d.ts';
import { IExecuteSQLParams, ISQLExecuteTask } from './executeSQL';
import modal from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';

export function executeSQLPreHandle(
  taskInfo: ISQLExecuteTask,
  params: IExecuteSQLParams | string,
  needModal: boolean,
  sessionId: string,
): {
  data: any;
  lintResultSet: ISQLLintReuslt[];
  pass: boolean;
  status?: EStatus;
} {
  const rootViolatedRules = taskInfo?.violatedRules?.reduce((pre, cur) => {
    if (cur?.violation) {
      return pre.concat({
        sqlTuple: {
          executedSql: cur?.violation?.text,
          offset: cur?.violation?.offset,
          originalSql: cur?.violation?.text,
        },
        violatedRules: [cur],
      });
    }
    return pre;
  }, []);
  const unauthorizedDBResources = taskInfo?.unauthorizedDBResources;
  const violatedRules = rootViolatedRules?.concat(taskInfo?.sqls);
  if (unauthorizedDBResources?.length) {
    // 无权限库
    return {
      data: {
        invalid: true,
        executeSuccess: false,
        executeResult: [],
        violatedRules: [],
        unauthorizedDBResources,
        unauthorizedSql: (params as IExecuteSQLParams)?.sql || (params as string),
      },
      lintResultSet: [],
      pass: false,
    };
  }
  const lintResultSet = violatedRules?.reduce((pre, cur) => {
    if (Array.isArray(cur?.violatedRules) && cur?.violatedRules?.length > 0) {
      return pre.concat({
        sql: cur?.sqlTuple?.executedSql,
        violations: cur?.violatedRules?.map((item) => item?.violation),
      });
    } else {
      return pre;
    }
  }, []);
  /**
   * lintResultSet为空数组时，返回的status默认为submit
   */
  const status = getStatus(lintResultSet);
  // 没有requestId，即是被拦截了
  if (!taskInfo?.requestId) {
    // 一些场景下不需要弹出SQL确认弹窗
    if (!needModal) {
      return {
        data: {
          hasLintResults: lintResultSet?.length > 0,
          invalid: true,
          executeSuccess: false,
          executeResult: [],
          violatedRules,
          lintResultSet,
          status,
        },
        status,
        lintResultSet,
        pass: false,
      };
    }
    // 当status不为submit时
    if (status !== EStatus.SUBMIT) {
      modal.updateWorkSpaceExecuteSQLModalProps({
        sql: (params as IExecuteSQLParams)?.sql || (params as string),
        visible: true,
        sessionId,
        lintResultSet,
        status,
        onSave: () => {
          // 关闭SQL确认窗口打开新建数据库变更抽屉
          modal.updateWorkSpaceExecuteSQLModalProps();
          modal.changeCreateAsyncTaskModal(true, {
            sql: (params as IExecuteSQLParams)?.sql || (params as string),
            databaseId: sessionManager.sessionMap.get(sessionId).odcDatabase?.id,
            rules: lintResultSet,
          });
        },
        // 关闭SQL确认弹窗
        onCancel: () =>
          modal.updateWorkSpaceExecuteSQLModalProps({
            visible: false,
          }),
      });
    }
  }
  const requestId = taskInfo?.requestId;
  const sqls = taskInfo?.sqls;
  if (!requestId || !sqls?.length) {
    return {
      data: null,
      lintResultSet,
      status,
      pass: false,
    };
  }
  return {
    lintResultSet,
    status,
    data: null,
    pass: true,
  };
}

function getStatus(lintResultSet: ISQLLintReuslt[]) {
  if (Array.isArray(lintResultSet) && lintResultSet?.length) {
    const violations = lintResultSet.reduce((pre, cur) => {
      if (cur?.violations?.length === 0) {
        return pre;
      }
      return pre.concat(...cur?.violations);
    }, []);
    // 含有必须改进， 中断后续操作，禁止执行
    if (violations?.some((violation) => violation?.level === 2)) {
      return EStatus.DISABLED;
      //  全为无需改进，继续原有的后续操作
    } else if (violations?.every((violation) => violation?.level === 0)) {
      return EStatus.SUBMIT;
    } else {
      // 既不含必须改进，又不全是无需改进，需要发起审批
      return EStatus.APPROVAL;
    }
  }
  // 默认返回submit，不中断后续操作
  return EStatus.SUBMIT;
}
