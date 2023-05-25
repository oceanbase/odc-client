import { Input, Select, Space } from 'antd';
import React from 'react';
import styles from '../index.less';
import type { IFilterContent, ITableLoadOptions } from '../interface';

const { Search } = Input;

interface IProps extends IFilterContent {
  params: ITableLoadOptions;
  onFilterChange: (name: string, value: any) => void;
  onSearchChange: (value: string) => void;
}

export const FilterContent: React.FC<IProps> = (props) => {
  const { params, filters: filterList, enabledSearch = true, searchPlaceholder } = props ?? {};
  const filterValue = params.filters;

  function renderFilter(filter, index): React.ReactNode {
    let Content = null;
    if (filter?.render) {
      Content = <span key={index}>{filter.render(params)}</span>;
    } else {
      const { name, title: filterTitle = '', options, defaultValue, dropdownWidth = true } = filter;
      Content = (
        <Space size={0} key={index}>
          {filterTitle && <span>{filterTitle}</span>}
          <Select
            showArrow
            dropdownMatchSelectWidth={dropdownWidth}
            defaultValue={defaultValue}
            value={filterValue?.[name]}
            bordered={false}
            options={options}
            onChange={(value) => {
              props.onFilterChange(name, value);
            }}
          />
        </Space>
      );
    }
    return Content;
  }

  return (
    <Space className={styles.filterContent}>
      {!!filterList?.length &&
        filterList.map((filter, index) => {
          return renderFilter(filter, index);
        })}
      {enabledSearch && (
        <Search
          enterButton={false}
          onSearch={(value: string) => {
            props.onSearchChange(value);
          }}
          placeholder={searchPlaceholder}
        />
      )}
    </Space>
  );
};
