import { SyncOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../ParamContext';
import Filter from './Filter';
import FilterIcon from '@/component/Button/FIlterIcon';
import Search from './Search';

interface IProps {}

const Header: React.FC<IProps> = function () {
  const context = useContext(ParamContext);

  return (
    <Space size={5} style={{ lineHeight: 1, paddingRight: 16 }}>
      <Search />
      <Filter />
      <FilterIcon
        onClick={() => {
          context.reload?.();
        }}
        border
      >
        <SyncOutlined spin={context?.loading} />
      </FilterIcon>
    </Space>
  );
};

export default Header;
