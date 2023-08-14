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

export default function WrapCheckboxFormatetr(key: string, isDisabled?: (row) => boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const value = row[key];
    return (
      <Checkbox
        checked={value}
        onKeyDown={(e) => console.log(e)}
        disabled={isDisabled?.(row)}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            [key]: !value,
          });
        }}
      />
    );
  };
}

export function WrapReverseCheckboxFormatetr(key: string, isDisabled?: (row) => boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const value = row[key];
    return (
      <Checkbox
        checked={!value}
        onKeyDown={(e) => console.log(e)}
        disabled={isDisabled?.(row)}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            [key]: !value,
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
export const ReadonlyCheckBoxFormatter = (props) => {
  const { row, onRowChange } = props;
  const { enable } = row;
  return (
    <Checkbox
      disabled={true}
      checked={!!enable}
      tabIndex={-1}
      onChange={() => {
        onRowChange({
          ...row,
          enable: !enable,
        });
      }}
    />
  );
};

export const CheckBoxFormatter = (props) => {
  const { row, onRowChange } = props;
  const { enable } = row;
  return (
    <Checkbox
      checked={!!enable}
      tabIndex={-1}
      onChange={() => {
        onRowChange({
          ...row,
          enable: !enable,
        });
      }}
    />
  );
};
