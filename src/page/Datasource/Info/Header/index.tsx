import { ReloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../ParamContext';
import Filter from './Filter';
import FilterIcon from '@/page/Datasource/Datasource/Header/FIlterIcon';

import styles from './index.less';
import Search from './Search';

interface IProps {}

const Header: React.FC<IProps> = function () {
  const context = useContext(ParamContext);

  return (
    <Space size={5} className={styles.right}>
      <Search />
      <Filter />
      <FilterIcon
        onClick={() => {
          context.reload?.();
        }}
      >
        <ReloadOutlined />
      </FilterIcon>
    </Space>
  );
};

export default Header;
