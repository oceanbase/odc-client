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

import FilterIcon from '@/component/Button/FIlterIcon';
import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
import type { BaseSelectRef } from 'rc-select';
import React, { forwardRef, useRef, useState } from 'react';

interface IProps {
  onSearch: (searchValue: string, searchType: string) => void;
  searchTypes: {
    label: string;
    value: string;
  }[];
}

const splitKey = Symbol('csearch')?.toString();

const RemoveSplitInput = forwardRef(function RemoveSplitInput({ value, ...rest }: any, ref) {
  let type;
  let typeText;
  if (value) {
    const arr = value.split(splitKey);
    value = arr?.[0];
    type = arr?.[1];
    typeText = arr?.[2];
  }
  return (
    <Input
      ref={ref}
      value={value}
      prefix={<SearchOutlined />}
      suffix={<span style={{ paddingRight: 15, color: 'var(--text-color-hint)' }}>{typeText}</span>}
      {...rest}
    />
  );
});

const Search: React.FC<IProps> = function ({ searchTypes, onSearch }) {
  const [forceVisible, setForceVisible] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [options, setOptions] = useState([]);
  const ref = useRef<BaseSelectRef>(null);
  const searchValueRef = useRef<string>(null);
  function getOptions(value) {
    if (!value) {
      setOptions([]);
      return;
    }

    setOptions(
      searchTypes?.map((v) => {
        return {
          value: value + splitKey + v.value + splitKey + v.label,
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
                {v.label}
              </div>
            </div>
          ),
        };
      }),
    );
    return;
  }
  if (!searchValueRef.current && !forceVisible) {
    return (
      <FilterIcon
        onClick={() => {
          setForceVisible(true);
        }}
      >
        <SearchOutlined />
      </FilterIcon>
    );
  }
  return (
    <AutoComplete
      ref={ref}
      options={options}
      autoFocus={forceVisible}
      onBlur={(e) => {
        setForceVisible(false);
        if (isEmpty) {
          onSearch(null, null);
        }
      }}
      onChange={(v) => {
        setIsEmpty(!v);
      }}
      // defaultValue={searchValue?.value ? searchValue.value + splitKey + searchValue.type : null}
      defaultActiveFirstOption
      onSearch={getOptions}
      onSelect={(v, option) => {
        const arr = v?.split(splitKey);
        if (arr.length) {
          searchValueRef.current = arr[0];
          onSearch(arr[0], arr[1]);
          ref.current?.blur();
        }
      }}
      allowClear
      onClear={() => {
        searchValueRef.current = null;
        onSearch(null, null);
      }}
    >
      <RemoveSplitInput />
    </AutoComplete>
  );
};

export default Search;
