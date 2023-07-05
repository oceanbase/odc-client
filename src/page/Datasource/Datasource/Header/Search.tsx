import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
import type { BaseSelectRef } from 'rc-select';
import React, { forwardRef, useContext, useRef, useState } from 'react';
import ParamContext, { SearchType, SearchTypeText } from '../ParamContext';
import FilterIcon from './FIlterIcon';

interface IProps {}

const splitKey = Symbol('csearch')?.toString();

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
      prefix={<SearchOutlined />}
      suffix={
        <span style={{ paddingRight: 15, color: 'var(--text-color-hint)' }}>
          {SearchTypeText[type]}
        </span>
      }
      {...rest}
    />
  );
});

const Search: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const [forceVisible, setForceVisible] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const { searchValue, setSearchvalue } = context;
  const [options, setOptions] = useState([]);
  const ref = useRef<BaseSelectRef>(null);
  function getOptions(value) {
    if (!value) {
      setOptions([]);
      return;
    }
    setOptions(
      [
        SearchType.ALL,
        SearchType.NAME,
        SearchType.CLUSTER,
        SearchType.TENANT,
        SearchType.HOST,
      ]?.map((v) => {
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
                {SearchTypeText[v]}
              </div>
            </div>
          ),
        };
      }),
    );
    return;
  }
  if (!searchValue?.value && !forceVisible) {
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
          setSearchvalue(null, null);
        }
      }}
      onChange={(v) => {
        setIsEmpty(!v);
      }}
      defaultValue={searchValue?.value ? searchValue.value + splitKey + searchValue.type : null}
      defaultActiveFirstOption
      onSearch={getOptions}
      onSelect={(v, option) => {
        const arr = v?.split(splitKey);
        if (arr.length) {
          context.setSearchvalue(arr[0], arr[1] as any);
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
