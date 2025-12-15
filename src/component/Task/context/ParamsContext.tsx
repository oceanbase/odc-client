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

import React from 'react';
import { IProject } from '@/d.ts/project';
import { ITaskParam, TaskPageMode, TaskTab } from '@/component/Task/interface';
import { IScheduleParam } from '@/component/Schedule/interface';
import { SchedulePageType } from '@/d.ts/schedule';
import { TaskPageType } from '@/d.ts';

interface IParamsContext {
  params?: ITaskParam;
  setParams?: (
    patch: Partial<ITaskParam> | ((prevState: ITaskParam) => Partial<ITaskParam>),
  ) => void;
  projectList: IProject[];
  reload?: () => void;
  mode?: TaskPageMode;
  taskTabType?: TaskPageType;
  loading?: boolean;
}

const ParamsContext: React.Context<IParamsContext> = React.createContext({
  projectList: [],
});

export default ParamsContext;
