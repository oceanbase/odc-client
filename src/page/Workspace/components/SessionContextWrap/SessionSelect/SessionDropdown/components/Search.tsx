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

import { AutoComplete, Input } from 'antd';
import React, { forwardRef, useContext, useRef, useState } from 'react';
import type { BaseSelectRef } from 'rc-select';
import { formatMessage } from '@/util/intl';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../index.less';
import SessionContext from '@/page/Workspace/components/SessionContextWrap/context';
import { DatabaseSearchType } from '@/d.ts/database';
import { DatabaseSearchTypeText } from '@/constant/database';

interface IProps {
  searchValue: { value: string; type: DatabaseSearchType };
  setSearchvalue: (v: string, type: DatabaseSearchType) => void;
  searchValueByDataSource: string;
  setSearchValueByDataSource: React.Dispatch<React.SetStateAction<string>>;
}

const splitKey = '_$$$odc$$$_';

const RemoveSplitInput = forwardRef(function RemoveSplitInput({ value, ...rest }: any, ref) {
  let type;
  if (value) {
    const arr = value.split(splitKey);
    value = arr?.[0];
    type = arr?.[1];
  }
  return (
    <Input
      ref={ref}
      value={value}
      prefix={<SearchOutlined style={{ color: 'var(--icon-color-normal)' }} />}
      suffix={
        <span style={{ paddingRight: 15, color: 'var(--text-color-hint)' }}>
          {DatabaseSearchTypeText[type]}
        </span>
      }
      {...rest}
    />
  );
});

const Search: React.FC<IProps> = function (props) {
  const { searchValue, setSearchvalue, searchValueByDataSource, setSearchValueByDataSource } =
    props;
  const [options, setOptions] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const ref = useRef<BaseSelectRef>(null);
  const context = useContext(SessionContext);

  if (context.datasourceMode) {
    return (
      <Input
        value={searchValueByDataSource}
        suffix={<SearchOutlined style={{ color: 'var(--icon-color-normal)' }} />}
        onChange={(e) => {
          setSearchValueByDataSource(e.target.value);
        }}
      />
    );
  }

  function getOptions(value) {
    if (!value) {
      setOptions([]);
      return;
    }
    setOptions(
      Object.values(DatabaseSearchType)?.map((v) => {
        return {
          value: value + splitKey + v,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {value}
              </div>
              <div style={{ flexShrink: 0, flexGrow: 0, color: 'var(--text-color-hint)' }}>
                {DatabaseSearchTypeText[v]}
              </div>
            </div>
          ),
        };
      }),
    );
    return;
  }

  return (
    <AutoComplete
      ref={ref}
      options={options}
      //   autoFocus={forceVisible}
      onBlur={(e) => {
        if (isEmpty && searchValue.value && searchValue.type) {
          setSearchvalue(null, null);
        }
      }}
      onChange={(v) => {
        setIsEmpty(!v);
      }}
      className={styles.search}
      defaultValue={searchValue?.value ? searchValue.value + splitKey + searchValue.type : null}
      defaultActiveFirstOption
      onSearch={getOptions}
      onSelect={(v, option) => {
        const arr = v?.split(splitKey);
        if (arr.length) {
          setSearchvalue(arr[0], arr[1] as any);
          ref.current?.blur();
        }
      }}
      allowClear
      onClear={() => {
        if (searchValue?.value) {
          setSearchvalue(null, null);
        }
      }}
    >
      <RemoveSplitInput />
    </AutoComplete>
  );
};
export default Search;
