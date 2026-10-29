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
