import { ReloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import React, { useContext } from 'react';
import ParamContext from '../ParamContext';
import Filter from './Filter';
import FilterIcon from './FIlterIcon';

import styles from './index.less';
import Search from './Search';
import Sorter from './Sorter';

interface IProps {}

const Header: React.FC<IProps> = function () {
  const context = useContext(ParamContext);

  return (
    <Space size={5} className={styles.right}>
      <Search />
      <Filter />
      <Sorter />
      <FilterIcon
        onClick={() => {
          context.reloadTable?.();
        }}
      >
        <ReloadOutlined />
      </FilterIcon>
    </Space>
  );
};

export default Header;
