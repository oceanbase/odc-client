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
import { SyncOutlined } from '@ant-design/icons';
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
    <Space size={5} style={{ lineHeight: 1, marginLeft: 4 }}>
      <Search />
      <Tabs />
      <Filter />
      <Sort />
      <FilterIcon border isActive={false}>
        <SyncOutlined onClick={() => context?.reload?.()} spin={context?.loading} />
      </FilterIcon>
    </Space>
  );
};
export default Header;
