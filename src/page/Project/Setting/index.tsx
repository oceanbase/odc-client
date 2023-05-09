import React from 'react';
interface IProps {
  id: string;
}
const Setting: React.FC<IProps> = (props) => {
  return <div className="">Page Project {props?.id} - 设置 </div>;
};

export default Setting;
