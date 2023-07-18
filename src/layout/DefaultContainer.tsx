/**
 * 老代码布局使用，有点冗余
 */
import { SettingStore } from '@/store/setting';
import { Outlet } from '@umijs/max';
import { Layout } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './DefaultContainer.less';

const { Content } = Layout;

@inject('settingStore')
@observer
class DefaultContainer extends React.Component<{
  settingStore: SettingStore;
}> {
  public render() {
    return (
      <Layout style={{ minWidth: '960px', height: '100%' }}>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    );
  }
}

export default DefaultContainer;
