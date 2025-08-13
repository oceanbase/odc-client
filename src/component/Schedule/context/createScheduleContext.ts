import React from 'react';
import { IDatabase } from '@/d.ts/database';

interface ICreateScheduleContext {
  createScheduleDatabase: IDatabase;
  setCreateScheduleDatabase: React.Dispatch<React.SetStateAction<IDatabase>>;
}

export const CreateScheduleContext = React.createContext<ICreateScheduleContext>(null);
