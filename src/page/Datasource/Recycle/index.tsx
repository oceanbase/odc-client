import { IDatasource } from '@/d.ts/datasource';
import React from 'react';
import RecycleBin from './RecycleBinPage';
interface IProps {
  id: string;
  datasource: IDatasource;
}
const Recycle: React.FC<IProps> = (props) => {
  return <RecycleBin dataSourceId={props.id} />;
};

export default Recycle;
