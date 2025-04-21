import { AutoComplete, Input } from 'antd';
import React, { forwardRef, useContext, useRef, useState } from 'react';
import type { BaseSelectRef } from 'rc-select';
import { formatMessage } from '@/util/intl';
import { SearchOutlined } from '@ant-design/icons';
import styles from '../index.less';
import SessionContext from '@/page/Workspace/components/SessionContextWrap/context';

interface IProps {
  searchValue: { value: string; type: SearchType };
  setSearchvalue: (v: string, type: SearchType) => void;
  searchValueByDataSource: string;
  setSearchValueByDataSource: React.Dispatch<React.SetStateAction<string>>;
}

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
      prefix={<SearchOutlined style={{ color: 'var(--icon-color-normal)' }} />}
      suffix={
        <span style={{ paddingRight: 15, color: 'var(--text-color-hint)' }}>
          {SearchTypeText[type]}
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
        suffix={<SearchOutlined style={{ color: 'var(--icon-normal-color)' }} />}
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
