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

import { dataTypesIns } from '@/util/dataType';
import { columnExtraComponent } from '../interface';
import Character from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/Character';
import DataSync from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/DateSync';
import DefaultValue from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/DefaultValue';
import Enum from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/Enum';
import Generation from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/Generation';
import Number from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/Number';

const MySQLColumnExtra: columnExtraComponent = ({
  column,
  originColumns,
  onChange,
  dialectType,
}) => {
  if (!column) {
    return null;
  }
  const isGeneratedColumn = !!column.generated;
  const dataType = dataTypesIns.getDataType(dialectType, column.type);
  if (!dataType) {
    return null;
  } else if (dataType.isChar || dataType.isText) {
    return (
      <>
        <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
        <Character column={column} onChange={onChange} />
        {isGeneratedColumn && <Generation column={column} onChange={onChange} />}
      </>
    );
  } else if (dataType.isNumber) {
    return (
      <>
        <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
        <Number column={column} onChange={onChange} />
        {isGeneratedColumn && <Generation column={column} onChange={onChange} />}
      </>
    );
  } else if (dataType.canSync) {
    return (
      <>
        <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
        <DataSync column={column} onChange={onChange} />
        {isGeneratedColumn && <Generation column={column} onChange={onChange} />}
      </>
    );
  } else if (dataType.isEnum) {
    return (
      <>
        <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
        <Enum column={column} onChange={onChange} />
      </>
    );
  } else if (column.generated) {
    <>
      <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
      <Generation column={column} onChange={onChange} />
    </>;
  } else {
    return <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />;
  }
};
export default MySQLColumnExtra;
