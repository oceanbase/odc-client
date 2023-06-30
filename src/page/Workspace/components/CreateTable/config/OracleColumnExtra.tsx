import { dataTypesIns } from '@/util/dataType';
import { columnExtraComponent } from '.';
import DefaultValue from '../Columns/ColumnExtraInfo/DefaultValue';
import Precision from '../Columns/ColumnExtraInfo/Precision';

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
