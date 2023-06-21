import TaskManage from '@/component/Task';
import React from 'react';
interface IProps {
  id: string;
}
const Task: React.FC<IProps> = (props) => {
  return <TaskManage projectId={Number(props.id)} />;
};

export default Task;
