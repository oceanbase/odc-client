import { canAcess } from '@/component/Acess';
import { IConnectionType } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { ReloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { isUndefined } from 'lodash';
import React, { useContext } from 'react';
import ParamContext from '../ParamContext';
import Filter from './Filter';
import FilterIcon from './FIlterIcon';

import { IManagerResourceType } from '@/d.ts';
import styles from './index.less';
import Search from './Search';
import Sorter from './Sorter';
import TitleRadio from './TitleRadio';

interface IProps {}

const Header: React.FC<IProps> = function () {
  const context = useContext(ParamContext);
  const EnabledPrivateConnection = canAcess({
    resourceIdentifier: IManagerResourceType.private_connection,
    action: 'use',
  }).accessible;
  const options = [
    {
      value: IConnectionType.ALL,
      label: formatMessage({ id: 'odc.ConnectionList.Header.ConnectAll' }), //全部连接
    },
    {
      value: IConnectionType.PRIVATE,
      label: formatMessage({
        id: 'odc.ConnectionList.Header.PersonalConnection',
      }), //个人连接
      enables: [!isClient(), EnabledPrivateConnection],
    },

    {
      value: IConnectionType.ORGANIZATION,
      label: formatMessage({
        id: 'odc.ConnectionList.Header.PublicConnection',
      }), //公共连接
      enables: [!isClient()],
    },
  ];
  const enabledOptions = options?.filter((option) => {
    return isUndefined(option?.enables) ? true : option.enables?.every((item) => item);
  });

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <TitleRadio
          options={enabledOptions}
          value={context.visibleScope}
          onChange={(v) => {
            context.setVisibleScope?.(v);
          }}
        />
      </div>
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
    </div>
  );
};

export default Header;
