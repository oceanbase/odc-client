import React from 'react';
interface IProps {
  id: string;
}
const Info: React.FC<IProps> = (props) => {
  return <div className="">Page Datasource {props?.id} - Info </div>;
};

export default Info;
