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
      label: '数据库',
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
