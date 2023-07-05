import { IDataType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Select } from 'antd';
import React, { forwardRef } from 'react';

const Option = Select.Option;

const DataTypeSelect: React.FC<{
  dataTypes: IDataType[];
  isOracle: boolean;
  ref?: React.Ref<any>;
}> = forwardRef((props, ref) => {
  const { dataTypes, isOracle, ...rest } = props;
  const _dataTypes = dataTypes.filter((dataType) => {
    return (
      isOracle
        ? ['blob', 'clob']
        : ['tinyblob', 'blob', 'mediumblob', 'logblob', 'binary', 'varbinary']
    ).includes(dataType.databaseType?.toLowerCase());
  });
  return (
    <Select
      mode="multiple"
      placeholder={formatMessage({
        id: 'odc.component.DataTypeSelect.SelectADataType',
      })}
      ref={ref}
      {...rest}
    >
      {_dataTypes.map((dataType) => {
        return (
          <Option value={dataType.databaseType} key={dataType.databaseType}>
            {dataType.databaseType}
          </Option>
        );
      })}
    </Select>
  );
});

export default DataTypeSelect;
