import { Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import Search from './Search';
import Filter from './Filter';
import Sort from './Sort';
import Tabs from './Tabs';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { useCallback, useContext } from 'react';

const Header = () => {
  const context = useContext(ParamsContext);

  return (
    <Space size={5} style={{ lineHeight: 1 }}>
      <Search />
      <Tabs />
      <Filter />
      <Sort />
      <FilterIcon border isActive={false}>
        <ReloadOutlined onClick={() => context?.reload?.()} />
      </FilterIcon>
    </Space>
  );
};
export default Header;
