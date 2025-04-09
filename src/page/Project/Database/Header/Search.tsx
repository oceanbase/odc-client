import { AutoComplete, Input } from 'antd';
import React, { forwardRef, useContext, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import type { BaseSelectRef } from 'rc-select';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamContext from '../ParamContext';

interface IProps {}

export enum SearchType {
  DATABASE = 'DATABASE',
  DATASOURCE = 'DATASOURCE',
  CLUSTER = 'CLUSTER',
  TENANT = 'TENANT',
}

export const SearchTypeText = {
  [SearchType.DATABASE]: formatMessage({
    id: 'src.component.ODCSetting.config.9EC92943',
    defaultMessage: '数据库',
  }), //'数据库'
  [SearchType.DATASOURCE]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }), //数据源
  [SearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [SearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
};
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
      placeholder={formatMessage({
        id: 'src.component.BatchSelectionPopover.9DC08FE8',
        defaultMessage: '搜索关键字',
      })}
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
  const [options, setOptions] = useState([]);
  const [forceVisible, setForceVisible] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const context = useContext(ParamContext);
  const { searchValue, setSearchvalue } = context;
  const [value, setValue] = useState('');

  const ref = useRef<BaseSelectRef>(null);

  function getOptions(value) {
    if (!value) {
      setOptions([]);
      return;
    }
    setOptions(
      [SearchType.DATABASE, SearchType.DATASOURCE, SearchType.CLUSTER, SearchType.TENANT]?.map(
        (v) => {
          return {
            value: value + splitKey + v,
            label: (
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
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
        },
      ),
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
        if (!searchValue.value && !value) {
          setForceVisible(false);
        }
        if (isEmpty && searchValue.value) {
          setSearchvalue(null, null);
        }
      }}
      onChange={(v) => {
        setValue(v);
        setIsEmpty(!v);
      }}
      value={value}
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
          setForceVisible(true);
        }
      }}
    >
      <RemoveSplitInput />
    </AutoComplete>
  );
};

export default Search;
