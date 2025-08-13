import { IState } from '../interface';
import React from 'react';

interface IScheduleDetailContext {
  handleDetailVisible: (task: any, visible?: boolean) => void;
  setState: (patch: Partial<IState> | ((prevState: IState) => Partial<IState>)) => void;
}

export const ScheduleDetailContext = React.createContext<IScheduleDetailContext>(null);
