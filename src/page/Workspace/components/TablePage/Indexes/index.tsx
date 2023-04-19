import React, { useContext, useState } from 'react';
import TableContext from '../../CreateTable/TableContext';
import TableIndex from '../../CreateTable/TableIndex';
import TablePageContext from '../context';

interface IProps {}

const TableIndexes: React.FC<IProps> = function ({}) {
  const [editIndexes, setEditIndexes] = useState(null);
  const tableContext = useContext(TablePageContext);
  const table = tableContext.table;
  return (
    <TableContext.Provider
      value={{
        indexes: editIndexes || table?.indexes,
        columns: table?.columns,
        session: tableContext.session,
        setIndexes: setEditIndexes,
      }}
    >
      <TableIndex modified={!!editIndexes} />
    </TableContext.Provider>
  );
};

export default TableIndexes;
