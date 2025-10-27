import { formatMessage } from '@/util/intl';
import React, { useContext, useState } from 'react';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { TaskCreateTimeSort } from '../../interface';
import { ReactComponent as SortSvg } from '@/svgr/sort.svg';
import { ReactComponent as SortActiveSvg } from '@/svgr/sort_active.svg';
import Icon from '@ant-design/icons';

interface IProps {}

const items: MenuProps['items'] = [
  {
    key: TaskCreateTimeSort.ASC,
    label: formatMessage({
      id: 'src.component.Task.layout.Header.D10FD400',
      defaultMessage: '按创建时间升序',
    }),
  },
  {
    key: TaskCreateTimeSort.DESC,
    label: formatMessage({
      id: 'src.component.Task.layout.Header.C84367F1',
      defaultMessage: '按创建时间降序',
    }),
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
        <Icon component={Boolean(sort) ? SortActiveSvg : SortSvg} />
      </FilterIcon>
    </Dropdown>
  );
};
export default inject('userStore')(observer(Sorter));
