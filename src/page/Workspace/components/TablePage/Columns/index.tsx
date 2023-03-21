import React, { useContext } from 'react';
import Columns from '../../CreateTable/Columns';
import TableContext from '../../CreateTable/TableContext';
import TablePageContext from '../context';

interface IProps {}

const TableColumns: React.FC<IProps> = function ({}) {
  const tableContext = useContext(TablePageContext);
  const table = tableContext.table;
  return (
    <TableContext.Provider
      value={{
        columns: table?.columns,
        setColumns: () => {},
      }}
    >
      <Columns />
    </TableContext.Provider>
  );
};

export default TableColumns;
