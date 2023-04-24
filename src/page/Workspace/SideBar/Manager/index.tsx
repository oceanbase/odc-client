import React from 'react';

import { openRecycleBin, openSessionManagePage } from '@/store/helper/page';
import MenuList from '../components/MenuList';
import styles from './index.less';

const Manager: React.FC<{}> = function () {
  return (
    <div className={styles.manager}>
      <MenuList
        data={[
          {
            title: '会话管理',
            key: 'sessionManager',
          },
          {
            title: '回收站',
            key: 'recycleBin',
          },
        ]}
        onClick={(node) => {
          switch (node.key) {
            case 'sessionManager': {
              openSessionManagePage();
              break;
            }
            case 'recycleBin': {
              openRecycleBin();
              break;
            }
          }
        }}
      />
    </div>
  );
};

export default Manager;
