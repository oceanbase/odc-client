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

import React, { forwardRef, useContext, useRef, useState } from 'react';
import ParamContext, { SearchType, SearchTypeText } from '../ParamContext';
import InputSelect from '@/component/InputSelect';

interface IProps {}

const Search: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const { searchValue, setSearchvalue } = context;

  const selectTypeOptions = [
    { label: SearchTypeText[SearchType.ALL], value: SearchType.ALL },
    { label: SearchTypeText[SearchType.NAME], value: SearchType.NAME },
    { label: SearchTypeText[SearchType.CLUSTER], value: SearchType.CLUSTER },
    { label: SearchTypeText[SearchType.TENANT], value: SearchType.TENANT },
    { label: SearchTypeText[SearchType.HOST], value: SearchType.HOST },
  ];

  return (
    <InputSelect
      searchValue={searchValue?.value}
      searchType={searchValue?.type}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setSearchvalue(searchValue, searchType as SearchType);
      }}
    />
  );
};

export default Search;
