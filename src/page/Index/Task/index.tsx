import TaskManaerPage from '@/component/Task';
import { TaskStore } from '@/store/task';
import { inject, observer } from 'mobx-react';
import React, { useEffect } from 'react';

interface IProps {
  taskStore?: TaskStore;
}

const Task: React.FC<IProps> = function ({ taskStore }) {
  useEffect(() => {
    taskStore.getTaskMetaInfo();
    taskStore.setTaskCreateEnabled(false);
    taskStore.showAllSchemaTaskType = true;
  }, []);
  return <TaskManaerPage />;
};

export default inject('taskStore')(observer(Task));
