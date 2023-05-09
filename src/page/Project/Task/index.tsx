import React from 'react';
interface IProps {
  id: string;
}
const Task: React.FC<IProps> = (props) => {
  return <div className="">Page Project {props?.id} - 任务 </div>;
};

export default Task;
