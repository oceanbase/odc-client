import React from 'react';
interface IProps {
  id: string;
}
const Database: React.FC<IProps> = (props) => {
  return <div className="">Page Project {props?.id} - 数据库 </div>;
};

export default Database;
