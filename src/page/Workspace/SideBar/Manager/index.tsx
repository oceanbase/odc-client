import { openRecycleBin, openSessionManagePage } from '@/store/helper/page';
import Icon from '@ant-design/icons';
import React from 'react';
import ListItem from '../components/ListItem';
import styles from './index.less';

import DeleteOutlined from '@/svgr/tabRecycle.svg';
import SettingOutlined from '@/svgr/tabSession.svg';
import { Space } from 'antd';
import SideTabs from '../components/SideTabs';

const Manager: React.FC<{}> = function () {
  return (
    <SideTabs
      tabs={[
        {
          title: '数据库运维',
          key: 'manager',
          actions: [],
          render() {
            return (
              <div className={styles.manager}>
                <Space style={{ width: '100%' }} direction="vertical">
                  <ListItem
                    key="sessionManager"
                    title="会话管理"
                    desc="管理数据源下所有会话信息"
                    icon={
                      <Icon
                        component={SettingOutlined}
                        style={{ fontSize: 18, color: 'var(--icon-green-color)' }}
                      />
                    }
                    actions={[]}
                    onClick={() => {
                      openSessionManagePage();
                    }}
                  />
                  <ListItem
                    key="sessionParams"
                    title="全局变量"
                    desc="查询和还原被删除的数据库对象"
                    icon={
                      <Icon
                        component={SettingOutlined}
                        style={{ fontSize: 18, color: 'var(--icon-orange-color)' }}
                      />
                    }
                    actions={[]}
                    onClick={() => {
                      openSessionManagePage();
                    }}
                  />
                  <ListItem
                    key="recyleBin"
                    title="回收站"
                    desc="查询和还原被删除的数据库对象"
                    icon={
                      <Icon
                        component={DeleteOutlined}
                        style={{ fontSize: 18, color: 'var(--icon-color-6)' }}
                      />
                    }
                    actions={[]}
                    onClick={() => {
                      openRecycleBin();
                    }}
                  />
                </Space>
              </div>
            );
          },
        },
      ]}
    />
  );
};

export default Manager;
