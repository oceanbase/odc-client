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

import { formatMessage } from '@/util/intl';
import { Button, Input, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

interface ISearchFilterProps extends FilterDropdownProps {
  placeholder: any;
  filters?: any;
  selectedKeys: any;
}

const SearchFilter: React.FC<ISearchFilterProps> = (props) => {
  const { placeholder, selectedKeys, confirm, setSelectedKeys } = props;
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearch = () => {
    setSelectedKeys([searchValue]);
    confirm();
  };

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleReset = () => {
    setSearchValue('');
    setSelectedKeys([]);
    confirm();
  };

  useEffect(() => {
    setSearchValue(selectedKeys?.[0]);
  }, [selectedKeys]);

  return (
    <Space size={12} className={styles.searchFilter} direction="vertical">
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onPressEnter={handleSearch}
      />

      <Space size={12} className={styles.footer}>
        <Button type="primary" onClick={handleSearch} block>
          {formatMessage({ id: 'odc.component.SearchFilter.Ok' }) /*确定*/}
        </Button>
        <Button onClick={handleReset} block>
          {formatMessage({ id: 'odc.component.SearchFilter.Reset' }) /*重置*/}
        </Button>
      </Space>
    </Space>
  );
};

export default SearchFilter;
