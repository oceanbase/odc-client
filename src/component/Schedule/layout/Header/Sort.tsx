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
import React, { useContext, useMemo } from 'react';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { ScheduleCreateTimeSort, ScheduleTaskCreateTimeSort } from '../../interface';
import { ReactComponent as SortSvg } from '@/svgr/sort.svg';
import { ReactComponent as SortActiveSvg } from '@/svgr/sort_active.svg';
import Icon from '@ant-design/icons';

interface IProps {}

const items: MenuProps['items'] = [
  {
    key: ScheduleCreateTimeSort.ASC,
    label: formatMessage({
      id: 'src.component.Schedule.layout.Header.0EF80738',
      defaultMessage: '按创建时间升序',
    }),
  },
  {
    key: ScheduleCreateTimeSort.DESC,
    label: formatMessage({
      id: 'src.component.Schedule.layout.Header.8112BEF7',
      defaultMessage: '按创建时间降序',
    }),
  },
];

const subTaskItems: MenuProps['items'] = [
  {
    key: ScheduleTaskCreateTimeSort.ASC,
    label: formatMessage({
      id: 'src.component.Schedule.layout.Header.55909F89',
      defaultMessage: '按执行时间排序',
    }),
  },
  {
    key: ScheduleTaskCreateTimeSort.DESC,
    label: formatMessage({
      id: 'src.component.Schedule.layout.Header.0E347077',
      defaultMessage: '按执行时间降序',
    }),
  },
];

const Sorter: React.FC<IProps> = function (props) {
  const context = useContext(ParamsContext);
  const { params, setParams, isScheduleView, subTaskParams, setsubTaskParams } = context;
  const { sort } = params || {};
  const { sort: subTaskSort } = subTaskParams || {};

  const sortKey = useMemo(() => {
    return isScheduleView ? [sort] : [subTaskSort];
  }, [isScheduleView, sort, subTaskSort]);

  const handleChangeSort = (e) => {
    if (isScheduleView) {
      setParams({ sort: e.key });
    } else {
      setsubTaskParams({ sort: e.key });
    }
  };

  const options = useMemo(() => {
    return isScheduleView ? items : subTaskItems;
  }, [isScheduleView]);

  const isActive = useMemo(() => {
    if (isScheduleView) {
      return Boolean(sort);
    } else {
      return Boolean(subTaskSort);
    }
  }, [sort, subTaskSort, isScheduleView]);

  return (
    <Dropdown
      menu={{
        selectedKeys: sortKey,
        items: options,
        onClick: handleChangeSort,
      }}
    >
      <FilterIcon isActive={isActive} border>
        <Icon component={isActive ? SortActiveSvg : SortSvg} />
      </FilterIcon>
    </Dropdown>
  );
};
export default inject('userStore')(observer(Sorter));
