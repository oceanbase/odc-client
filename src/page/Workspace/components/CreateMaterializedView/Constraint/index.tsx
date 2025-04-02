import React, { useContext } from 'react';
import PrimaryConstaint from './Primary';
import MViewContext from '../context/MaterializedViewContext';

interface IProps {
  modified?: boolean;
}

const Constraint: React.FC<IProps> = (props) => {
  const { modified } = props;
  const mviewContext = useContext(MViewContext);
  const { session, columns, primaryConstraints, setPrimaryConstraints } = mviewContext;

  return (
    <PrimaryConstaint
      session={session}
      columns={columns}
      primaryConstraints={primaryConstraints}
      setPrimaryConstraints={setPrimaryConstraints}
      editMode={false}
      modified={modified}
    />
  );
};
export default Constraint;
