import React from 'react';
interface IProps {
  id: string;
}
const Session: React.FC<IProps> = (props) => {
  return <div className="">Page Datasource {props?.id} - Session </div>;
};

export default Session;
