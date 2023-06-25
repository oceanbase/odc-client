import React from 'react';
import SessionManager from './SessionManagementPage';
interface IProps {
  id: string;
}
const Session: React.FC<IProps> = (props) => {
  return <SessionManager dataSourceId={parseInt(props.id)} />;
};

export default Session;
