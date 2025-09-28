import { SearchOutlined } from '@ant-design/icons';
import type { BaseSelectRef } from 'rc-select';
import FilterIcon from '@/component/Button/FIlterIcon';
import { AutoComplete, Input, Tooltip } from 'antd';
import React, { forwardRef, useRef, useState } from 'react';
import { formatMessage } from '@/util/intl';

const RemoveSplitInput = forwardRef(function RemoveSplitInput(
  { value, selectTypeOptions, searchTypeLabel, ...rest }: any,
  ref,
) {
  let searchValue;
  if (value) {
    const arr = value.split(splitKey);
    searchValue = arr?.[0];
  }
  return (
    <Input
      {...rest}
      ref={ref}
      value={searchValue}
      placeholder={formatMessage({
        id: 'src.component.BatchSelectionPopover.9DC08FE8',
        defaultMessage: '搜索关键字',
      })}
      prefix={<SearchOutlined />}
      suffix={
        <span style={{ paddingRight: 15, color: 'var(--text-color-hint)' }}>{searchTypeLabel}</span>
      }
    />
  );
});

const splitKey = '_$$$odc$$$_';

interface InputSelectProps {
  onSelect: (params: { searchValue: string; searchType: React.Key }) => void;
  selectTypeOptions: { label: string; value: React.Key }[];
  searchValue: string;
  searchType: React.Key;
  style?: React.CSSProperties;
}

const InputSelect: React.FC<InputSelectProps> = (props) => {
  const [options, setOptions] = useState([]);
  const [forceVisible, setForceVisible] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const ref = useRef<BaseSelectRef>(null);
  const { onSelect, selectTypeOptions = [], searchValue, searchType, style } = props;
  const [value, setValue] = useState(searchValue ? `${searchValue}${splitKey}${searchType}` : '');

  const getOptions = (value) => {
    if (!value) {
      setOptions([]);
      return;
    }

    setOptions(
      selectTypeOptions?.map((item) => {
        let _value = value.split(splitKey)?.[0] ?? value;
        return {
          value: _value + splitKey + item.value,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Tooltip title={_value} placement="topLeft">
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {_value}
                </div>
              </Tooltip>
              <div style={{ flexShrink: 0, flexGrow: 0, color: 'var(--text-color-hint)' }}>
                {item.label}
              </div>
            </div>
          ),
        };
      }),
    );
  };

  if (!searchValue && !forceVisible) {
    return (
      <FilterIcon
        onClick={() => {
          setForceVisible(true);
        }}
        border
      >
        <SearchOutlined />
      </FilterIcon>
    );
  }

  const searchTypeLabel = () => {
    return selectTypeOptions?.find((item) => item.value === searchType)?.label;
  };

  return (
    <AutoComplete
      ref={ref}
      defaultActiveFirstOption={false}
      options={options}
      style={style}
      autoFocus={forceVisible}
      onBlur={(e) => {
        if (!searchValue && !value) {
          setForceVisible(false);
        }
        if (value) {
          const _type = searchType || selectTypeOptions?.[0].value;
          const _serachValue = value?.split(splitKey)?.[0] || value;
          onSelect?.({ searchValue: _serachValue, searchType: _type });
        }
        if (isEmpty && !value) {
          onSelect?.({ searchValue: undefined, searchType: undefined });
        }
      }}
      onChange={(v) => {
        setValue(v);
        setIsEmpty(!v);
      }}
      value={value}
      defaultValue={searchValue ? searchValue + splitKey + searchType : null}
      onSearch={(v) => {
        getOptions(v);
      }}
      onSelect={(v, option) => {
        const arr = v?.split(splitKey);
        if (arr.length) {
          ref.current?.blur();
          onSelect?.({ searchValue: arr[0], searchType: arr[1] as React.Key });
        }
      }}
      allowClear
      onClear={() => {
        if (searchValue) {
          onSelect?.({ searchValue: undefined, searchType: undefined });
          setForceVisible(true);
        }
      }}
    >
      <RemoveSplitInput searchTypeLabel={searchTypeLabel()} />
    </AutoComplete>
  );
};

export default InputSelect;
