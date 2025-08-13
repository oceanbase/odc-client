import type { TaskRecord, TaskRecordParameters } from '@/d.ts';
import React from 'react';
import { IState } from '@/component/Task/interface';

interface ITaskDetailContext {
  handleDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible?: boolean) => void;
  setState: (patch: Partial<IState> | ((prevState: IState) => Partial<IState>)) => void;
}

export const TaskDetailContext = React.createContext<ITaskDetailContext>(null);
