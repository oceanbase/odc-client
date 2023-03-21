import { ConnectionMode } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { Select } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { forwardRef } from 'react';

const Option = Select.Option;

const DataTypeSelect: React.FC<{
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  ref?: React.Ref<any>;
}> = inject(
  'schemaStore',
  'connectionStore',
)(
  observer(
    forwardRef((props, ref) => {
      const { schemaStore, connectionStore, ...rest } = props;
      const isOracle = connectionStore.connection.dbMode === ConnectionMode.OB_ORACLE;
      const dataTypes = schemaStore?.dataTypes.filter((dataType) => {
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
          {dataTypes.map((dataType) => {
            return (
              <Option value={dataType.databaseType} key={dataType.databaseType}>
                {dataType.databaseType}
              </Option>
            );
          })}
        </Select>
      );
    }),
  ),
);

export default DataTypeSelect;
