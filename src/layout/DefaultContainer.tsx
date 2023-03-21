import { SettingStore } from '@/store/setting';
import { Outlet } from '@umijs/max';
import { Layout } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './AppContainer.less';

const { Content } = Layout;

@inject('settingStore')
@observer
class DefaultContainer extends React.Component<{
  settingStore: SettingStore;
}> {
  public render() {
    return (
      <Layout style={{ minWidth: '960px' }}>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    );
  }
}

export default DefaultContainer;
