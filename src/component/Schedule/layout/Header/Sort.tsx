import React, { useContext, useMemo } from 'react';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import ParamsContext from '@/component/Schedule/context/ParamsContext';

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

const subTaskItems: MenuProps['items'] = [
  {
    key: 'fireTime,asc',
    label: '按执行时间排序',
  },
  {
    key: 'fireTime,desc',
    label: '按执行时间降序',
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
        <SortAscendingOutlined />
      </FilterIcon>
    </Dropdown>
  );
};
export default inject('userStore')(observer(Sorter));
