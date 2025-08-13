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
