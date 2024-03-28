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
import { SortAscendingOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import React, { useContext } from 'react';
import ParamContext, { SortType } from '../../ParamContext';
import FilterIcon from '../FIlterIcon';

interface IProps {}

const Sorter: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  return (
    <Dropdown
      trigger={['hover']}
      menu={{
        selectedKeys: [context?.sortType],
        onClick: (v) => {
          if (context?.sortType === v.key) {
            context.setSortType?.(null);
            return;
          }
          context.setSortType?.(v.key as SortType);
        },
        items: [
          {
            key: SortType.CREATE_TIME,
            label: formatMessage({
              id: 'odc.Header.Sorter.SortByCreationTime',
            }) /*按创建时间排序*/,
          },
          {
            key: SortType.UPDATE_TIME,
            label: formatMessage({
              id: 'odc.Header.Sorter.SortByUpdateTime',
            }) /*按更新时间排序*/,
          },
          {
            key: SortType.NAME_AZ,
            label: formatMessage({
              id: 'odc.Header.Sorter.SortByDataSourceName',
            }) /*按数据源名(A-Z)排序*/,
          },
          {
            key: SortType.NAME_ZA,
            label: formatMessage({
              id: 'odc.Header.Sorter.SortByDataSourceName.1',
            }) /*按数据源名(Z-A)排序*/,
          },
        ],
      }}
    >
      <FilterIcon isActive={!!context?.sortType}>
        <SortAscendingOutlined />
      </FilterIcon>
    </Dropdown>
  );
};

export default Sorter;
