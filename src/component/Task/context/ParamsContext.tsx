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
