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
