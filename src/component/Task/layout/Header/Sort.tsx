import { formatMessage } from '@/util/intl';
import React, { useContext, useState } from 'react';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import { UserStore } from '@/store/login';
import { ReactComponent as GroupSvg } from '@/svgr/group.svg';
import Icon from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { DatabaseGroup } from '@/d.ts/database';
import { SortAscendingOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Task/context/ParamsContext';

interface IProps {}

const items: MenuProps['items'] = [
  {
    key: 'createTime,asc',
    label: '按创建时间排序',
  },
  {
    key: 'createTime,desc',
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
