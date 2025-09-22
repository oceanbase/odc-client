import { Space } from 'antd';
import FilterIcon from '@/component/Button/FIlterIcon';
import Sort from '@/component/Schedule/layout/Header/Sort';
import Tabs from './Tabs';
import Segment from '@/component/Schedule/layout/Header/Segment';
import Search from './Search';
import Filter from './Filter/index';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext } from 'react';
import SubTaskSearch from './SubTaskSearch';
import { SyncOutlined } from '@ant-design/icons';
import login from '@/store/login';

const Header = () => {
  const context = useContext(ParamsContext);

  return (
    <Space size={5} style={{ lineHeight: 1 }}>
      {context.isScheduleView ? <Search /> : <SubTaskSearch />}
      {context.isScheduleView && !login.isPrivateSpace() ? <Tabs /> : undefined}
      <Filter />
      <Sort />
      <FilterIcon border isActive={false}>
        <SyncOutlined onClick={() => context?.reload?.()} />
      </FilterIcon>
      <Segment />
    </Space>
  );
};
export default Header;
