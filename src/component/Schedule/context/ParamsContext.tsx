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
import {
  IScheduleParam,
  Perspective,
  ISubTaskParam,
  SchedulePageMode,
} from '@/component/Schedule/interface';
import { SchedulePageType } from '@/d.ts/schedule';

interface IParamsContext {
  params?: IScheduleParam;
  setParams?: (
    patch: Partial<IScheduleParam> | ((prevState: IScheduleParam) => Partial<IScheduleParam>),
  ) => void;
  subTaskParams?: ISubTaskParam;
  setsubTaskParams?: (
    patch: Partial<ISubTaskParam> | ((prevState: ISubTaskParam) => Partial<ISubTaskParam>),
  ) => void;
  projectList: IProject[];
  scheduleTabType?: SchedulePageType;
  perspective?: Perspective;
  setPerspective?: React.Dispatch<React.SetStateAction<Perspective>>;
  isScheduleView?: boolean;
  reload?: () => void;
  mode?: SchedulePageMode;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  loading?: boolean;
}

const ParamsContext: React.Context<IParamsContext> = React.createContext({
  projectList: [],
});

export default ParamsContext;
