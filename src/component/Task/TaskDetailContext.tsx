import type { ICycleTaskRecord, TaskRecord, TaskRecordParameters } from '@/d.ts';
import React from 'react';
import { IState } from './Content';

interface ITaskDetailContext {
  handleDetailVisible: (
    task: TaskRecord<TaskRecordParameters> | ICycleTaskRecord<any>,
    visible?: boolean,
  ) => void;
  setState: (patch: Partial<IState> | ((prevState: IState) => Partial<IState>)) => void;
}

export const TaskDetailContext = React.createContext<ITaskDetailContext>(null);
