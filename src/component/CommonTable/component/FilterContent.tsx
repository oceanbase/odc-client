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
