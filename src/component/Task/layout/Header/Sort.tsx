import React, { useContext, useState } from 'react';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { TaskCreateTimeSort } from '../../interface';

interface IProps {}

const items: MenuProps['items'] = [
  {
    key: TaskCreateTimeSort.ASC,
    label: '按创建时间升序',
  },
  {
    key: TaskCreateTimeSort.DESC,
    label: '按创建时间降序',
  },
];

const Sorter: React.FC<IProps> = function (props) {
  const context = useContext(ParamsContext);
  const { params, setParams } = context;
  const { sort } = params || {};
  const handleChangeSort = (e) => {
    setParams({ sort: e.key });
  };

  return (
    <Dropdown
      menu={{
        selectedKeys: [sort],
        items: items,
        onClick: handleChangeSort,
      }}
    >
      <FilterIcon isActive={Boolean(sort)} border>
        <SortAscendingOutlined />
      </FilterIcon>
    </Dropdown>
  );
};
export default inject('userStore')(observer(Sorter));
