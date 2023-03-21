import { dataTypesIns } from '@/util/dataType';
import { inject, observer } from 'mobx-react';
import { columnExtraComponent } from '.';
import DefaultValue from '../Columns/ColumnExtraInfo/DefaultValue';
import Precision from '../Columns/ColumnExtraInfo/Precision';

const OracleColumnExtra: columnExtraComponent = ({
  column,
  originColumns,
  onChange,
  connectionStore,
}) => {
  if (!column) {
    return null;
  }
  const dataType = dataTypesIns.getDataType(connectionStore.connection.dialectType, column.type);
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
export default inject('connectionStore')(observer(OracleColumnExtra));
