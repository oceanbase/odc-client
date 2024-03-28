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

import { useState } from 'react';
import { getProjectList } from '@/common/network/task';

export const useProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);

  const projectOptions = projects?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const loadProjects = async () => {
    const res = await getProjectList(false);
    setProjects(res?.contents);
  };

  return {
    projects,
    projectOptions,
    loadProjects,
  };
};
