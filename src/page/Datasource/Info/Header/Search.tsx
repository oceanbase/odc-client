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
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { useContext, useState } from 'react';
import ParamContext from '../ParamContext';
import FilterIcon from '@/page/Datasource/Datasource/Header/FIlterIcon';

interface IProps {}

const Search: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const [active, setIsActive] = useState(false);

  const changeInput = (e) => {
    context?.setSearchValue(e.target.value);
  };

  const handleBlur = () => {
    if (!context?.searchValue) {
      setIsActive(false);
    }
  };

  if (!active) {
    return (
      <FilterIcon
        onClick={() => {
          setIsActive(true);
        }}
      >
        <SearchOutlined />
      </FilterIcon>
    );
  }
  return (
    <Input.Search
      prefix={<SearchOutlined />}
      placeholder={formatMessage({
        id: 'src.page.Datasource.Info.Header.B547D3A4',
        defaultMessage: '搜索数据库',
      })}
      onChange={changeInput}
      onBlur={handleBlur}
      onSearch={(v) => {
        context?.reload();
      }}
    />
  );
};

export default Search;
