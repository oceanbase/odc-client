import type { ITaskConfig } from '@/common/task';
import { TaskGroup } from '@/d.ts/task';
import { useMemo } from 'react';
import { TaskGroupTextMap } from '@/constant/task';
import { TaskPageType } from '@/d.ts';

const useTaskGroup = (props: { taskItems: ITaskConfig[] }) => {
  const { taskItems } = props;

  const results = useMemo(() => {
    const _results: Array<{
      label: string;
      key: TaskGroup;
      children: Array<{ label: string; value: TaskPageType }>;
    }> = Object.values(TaskGroup).map((item) => ({
      label: TaskGroupTextMap[item],
      key: item,
      children: [],
    }));
    _results.forEach((at) => {
      taskItems.forEach((item) => {
        if (!item.enabled()) {
          return;
        }
        if (item.groupBy === at.key) {
          at.children.push({
            label: item.label,
            value: item.pageType,
          });
        }
      });
    });
    return _results.filter((item) => item.children.length);
  }, [taskItems]);

  return { results };
};

export default useTaskGroup;
