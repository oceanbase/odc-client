import React from 'react';
import { IProject } from '@/d.ts/project';
import { ITaskParam, TaskPageMode, TaskTab } from '@/component/Task/interface';
import { IScheduleParam } from '@/component/Schedule/interface';
import { SchedulePageType } from '@/d.ts/schedule';

export const defaultParam: ITaskParam = {
  searchValue: undefined,
  searchType: undefined,
  taskTypes: [],
  taskStatus: [],
  projectId: [],
  sort: '',
  tab: TaskTab.all,
  timeRange: 7,
  executeDate: [undefined, undefined],
};

interface IParamsContext {
  params?: ITaskParam;
  setParams?: (
    patch: Partial<ITaskParam> | ((prevState: ITaskParam) => Partial<ITaskParam>),
  ) => void;
  projectList: IProject[];
  reload?: () => void;
  scheduleTabType?: SchedulePageType;
  mode?: TaskPageMode;
}

const ParamsContext: React.Context<IParamsContext> = React.createContext({
  projectList: [],
});

export default ParamsContext;
