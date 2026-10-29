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
import { SearchOutlined } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';
import type { BaseSelectRef } from 'rc-select';
import FilterIcon from '@/component/Button/FIlterIcon';
import InputSelect from '@/component/InputSelect';
import ParamContext from '../ParamContext';
import { DatabaseSearchType } from '@/d.ts/database';
import { DatabaseSearchTypeText } from '@/constant/database';

interface IProps {}

const Search: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const { searchValue, setSearchvalue } = context;

  const selectTypeOptions = [
    {
      label: DatabaseSearchTypeText[DatabaseSearchType.SCHEMA_NAME],
      value: DatabaseSearchType.SCHEMA_NAME,
    },
    {
      label: DatabaseSearchTypeText[DatabaseSearchType.DATASOURCE_NAME],
      value: DatabaseSearchType.DATASOURCE_NAME,
    },
    {
      label: DatabaseSearchTypeText[DatabaseSearchType.CLUSTER_NAME],
      value: DatabaseSearchType.CLUSTER_NAME,
    },
    {
      label: DatabaseSearchTypeText[DatabaseSearchType.TENANT_NAME],
      value: DatabaseSearchType.TENANT_NAME,
    },
  ];

  return (
    <InputSelect
      searchValue={searchValue?.value}
      searchType={searchValue?.type}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setSearchvalue(searchValue, searchType as DatabaseSearchType);
      }}
    />
  );
};

export default Search;
