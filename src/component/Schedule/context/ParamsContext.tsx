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
}

const ParamsContext: React.Context<IParamsContext> = React.createContext({
  projectList: [],
});

export default ParamsContext;
