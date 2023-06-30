import React from 'react';
import RecycleBin from './RecycleBinPage';
interface IProps {
  id: string;
}
const Recycle: React.FC<IProps> = (props) => {
  return <RecycleBin dataSourceId={props.id} />;
};

export default Recycle;
