import React from 'react';
interface IProps {
  id: string;
}
const User: React.FC<IProps> = (props) => {
  return <div className="">Page Project {props?.id} - 用户 </div>;
};

export default User;
