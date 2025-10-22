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
