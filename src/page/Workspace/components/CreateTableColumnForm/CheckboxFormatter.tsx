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

import { isSupportAutoIncrement } from '@/util/utils';
import { Checkbox } from 'antd';

export default function WrapCheckboxFormatetr(editable: boolean, enablePrimaryKeyEditor: boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const { initialValue, allowNull, primaryKey } = row;
    return (
      <Checkbox
        disabled={!editable || (primaryKey && enablePrimaryKeyEditor) || initialValue?.allowNull}
        checked={!allowNull}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            allowNull: !allowNull,
          });
        }}
      />
    );
  };
}

export function WrapOracleCheckboxFormatetr(editable: boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const { autoIncreament, dataType } = row;
    return (
      <Checkbox
        tabIndex={-1}
        disabled={!editable || !isSupportAutoIncrement(dataType)}
        checked={!!autoIncreament}
        onChange={() => {
          onRowChange({
            ...row,
            autoIncreament: !autoIncreament,
          });
        }}
      />
    );
  };
}
