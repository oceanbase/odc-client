import { dataTypesIns } from '@/util/dataType';
import { inject, observer } from 'mobx-react';
import { columnExtraComponent } from '.';
import Character from '../Columns/ColumnExtraInfo/Character';
import DataSync from '../Columns/ColumnExtraInfo/DateSync';
import DefaultValue from '../Columns/ColumnExtraInfo/DefaultValue';
import Enum from '../Columns/ColumnExtraInfo/Enum';
import Generation from '../Columns/ColumnExtraInfo/Generation';
import Number from '../Columns/ColumnExtraInfo/Number';

const MySQLColumnExtra: columnExtraComponent = ({
  column,
  originColumns,
  onChange,
  connectionStore,
}) => {
  if (!column) {
    return null;
  }
  const isGeneratedColumn = !!column.generated;
  const dataType = dataTypesIns.getDataType(connectionStore.connection.dialectType, column.type);
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
export default inject('connectionStore')(observer(MySQLColumnExtra));
