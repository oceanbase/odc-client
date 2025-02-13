/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext } from 'react';
import Columns from '../../CreateTable/Columns';
import TableContext from '../../CreateTable/TableContext';
import TablePageContext from '../context';

interface IProps {
  isExternalTable: boolean;
}

const TableColumns: React.FC<IProps> = function ({ isExternalTable }) {
  const tableContext = useContext(TablePageContext);
  const table = tableContext.table;
  return (
    <TableContext.Provider
      value={{
        columns: table?.columns,
        session: tableContext.session,
        setColumns: () => {},
      }}
    >
      <Columns isExternalTable={isExternalTable} />
    </TableContext.Provider>
  );
};

export default TableColumns;
