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
import React, { useContext, useState } from 'react';
import ParamContext from '../ParamContext';
import InputSelect from '@/component/InputSelect';

enum DatabaseSearchType {
  database = 'database',
}
interface IProps {}

const Search: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const [searchType, setSearchType] = useState<DatabaseSearchType>(undefined);
  const selectTypeOptions = [
    {
      label: formatMessage({
        id: 'src.page.Datasource.Info.Header.E5DAC2D1',
        defaultMessage: '数据库',
      }),
      value: DatabaseSearchType.database,
    },
  ];

  return (
    <InputSelect
      searchValue={context?.searchValue}
      searchType={searchType}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setSearchType(searchType as DatabaseSearchType);
        context?.setSearchValue(searchValue);
        // 直接传递searchValue参数，确保使用最新的搜索值
        context?.reload?.(searchValue);
      }}
    />
  );
};

export default Search;
