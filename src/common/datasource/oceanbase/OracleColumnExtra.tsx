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
import DefaultValue from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/DefaultValue';
import Precision from '@/page/Workspace/components/CreateTable/Columns/ColumnExtraInfo/Precision';

const OracleColumnExtra: columnExtraComponent = ({
  column,
  originColumns,
  onChange,
  dialectType,
}) => {
  if (!column) {
    return null;
  }
  const dataType = dataTypesIns.getDataType(dialectType, column.type);
  if (!dataType) {
    return null;
  } else {
    return (
      <>
        <DefaultValue originColumns={originColumns} column={column} onChange={onChange} />
        <Precision
          column={column}
          onChange={onChange}
          secondPrecision={dataType.secondPrecision}
          dayPrecision={dataType.dayPrecision}
          yearPrecision={dataType.yearPrecision}
        />
      </>
    );
  }
};
export default OracleColumnExtra;
