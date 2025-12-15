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
    <Space size={5} style={{ lineHeight: 1, marginLeft: 4 }}>
      {context.isScheduleView ? <Search /> : <SubTaskSearch />}
      {context.isScheduleView && !login.isPrivateSpace() ? <Tabs /> : undefined}
      <Filter />
      <Sort />
      <FilterIcon border isActive={false}>
        <SyncOutlined onClick={() => context?.reload?.()} spin={context?.loading} />
      </FilterIcon>
      <Segment />
    </Space>
  );
};
export default Header;
