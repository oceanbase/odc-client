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

import { useCallback } from 'react';
import { useLocation, useNavigate } from '@umijs/max';
import { TaskPageType } from '@/d.ts';

export const URL_ACTION = {
  newDatasource: 'newDatasource',
  newProject: 'newProject',
  newTask: 'newTask',
  newApply: 'newApply',
  newDataMock: 'newDataMock',
  dataMock: TaskPageType.DATAMOCK,
};

const useUrlAction = () => {
  const location = useLocation(); // 获取当前 URL 信息
  const navigate = useNavigate();

  const runAction = useCallback(
    ({ actionType, callback }: { actionType: string; callback: () => void }) => {
      const params = new URLSearchParams(location.search);
      const action = params.get('action');

      if (action && action === actionType) {
        callback?.();
        params.delete('action');
        navigate({ search: params.toString() }, { replace: true });
        return true;
      }
      return false;
    },
    [location, navigate],
  );

  const runTask = useCallback(
    ({ callback }: { callback: (task: string) => void }) => {
      const params = new URLSearchParams(location.search);
      const task = params.get('task');

      if (task) {
        callback?.(task);
        params.delete('task');
        navigate({ search: params.toString() }, { replace: true }); // 更新 URL，但不加入浏览历史记录
        return true;
      }

      return false;
    },
    [location, navigate],
  );
  return { runAction, runTask };
};
export default useUrlAction;
