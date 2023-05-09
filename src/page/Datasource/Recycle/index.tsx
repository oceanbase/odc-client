import React from 'react';
interface IProps {
  id: string;
}
const Recycle: React.FC<IProps> = (props) => {
  return <div className="">Page Datasource {props?.id} - Recycle </div>;
};

export default Recycle;
