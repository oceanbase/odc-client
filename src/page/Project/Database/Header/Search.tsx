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
        id: 'src.page.Project.Database.Header.9B30F6BB',
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
