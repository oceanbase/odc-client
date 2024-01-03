/*
 * Copyright 2024 OceanBase
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
    return (isOracle
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
