import { Space } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../ParamContext';
import Filter from './Filter';
import FilterIcon from '@/component/Button/FIlterIcon';
import styles from './index.less';
import Search from './Search';
import Group from './Group';
import { SyncOutlined } from '@ant-design/icons';

interface IProps {}

const Header: React.FC<IProps> = function () {
  const context = useContext(ParamContext);

  return (
    <Space size={5} style={{ lineHeight: 1 }}>
      <Search />
      <Filter />
      <Group border />
      <FilterIcon
        border
        onClick={() => {
          context.reload?.();
        }}
      >
        <SyncOutlined spin={context?.loading} />
      </FilterIcon>
    </Space>
  );
};

export default Header;
