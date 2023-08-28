/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { openRecycleBin, openSessionManagePage, openSessionParamsPage } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import React, { useEffect } from 'react';
import ListItem from '../components/ListItem';
import styles from './index.less';

import { Space } from 'antd';
import SideTabs from '../components/SideTabs';

import TabRecycleSvg from '@/svgr/tabRecycle.svg';
import SettingOutlined from '@/svgr/tabSession.svg';
import VariableSvg from '@/svgr/variable.svg';
import tracert from '@/util/tracert';

const Manager: React.FC<{}> = function () {
  useEffect(() => {
    tracert.expo('a3112.b41896.c330995');
  }, []);
  return (
    <SideTabs
      tabs={[
        {
          title: formatMessage({ id: 'odc.SideBar.Manager.DatabaseOM' }), //数据库运维
          key: 'manager',
          actions: [],
          render() {
            return (
              <div className={styles.manager}>
                <Space style={{ width: '100%' }} direction="vertical">
                  <ListItem
                    key="sessionManager"
                    title={formatMessage({
                      id: 'odc.SideBar.Manager.SessionManagement',
                    })} /*会话管理*/
                    desc={formatMessage({
                      id: 'odc.SideBar.Manager.ManageAllSessionInformationIn',
                    })} /*管理数据源下所有会话信息*/
                    icon={
                      <Icon
                        component={SettingOutlined}
                        style={{ fontSize: 18, color: 'var(--icon-green-color)' }}
                      />
                    }
                    actions={[]}
                    onClick={() => {
                      tracert.click('a3112.b41896.c330995.d367632', {
                        manageType: 'sessionManager',
                      });
                      openSessionManagePage();
                    }}
                  />

                  <ListItem
                    key="sessionParams"
                    title={formatMessage({
                      id: 'odc.SideBar.Manager.GlobalVariables',
                    })} /*全局变量*/
                    desc={formatMessage({
                      id: 'odc.SideBar.Manager.ManageAllSessionVariablesIn',
                    })} /*管理数据源下所有会话变量*/
                    icon={<Icon component={VariableSvg} style={{ fontSize: 18 }} />}
                    actions={[]}
                    onClick={() => {
                      tracert.click('a3112.b41896.c330995.d367632', {
                        manageType: 'sessionParams',
                      });
                      openSessionParamsPage();
                    }}
                  />

                  <ListItem
                    key="recyleBin"
                    title={formatMessage({ id: 'odc.SideBar.Manager.RecycleBin' })} /*回收站*/
                    desc={formatMessage({
                      id: 'odc.SideBar.Manager.QueryAndRestoreDeletedDatabase',
                    })} /*查询和还原被删除的数据库对象*/
                    icon={<Icon component={TabRecycleSvg} style={{ fontSize: 18 }} />}
                    actions={[]}
                    onClick={() => {
                      tracert.click('a3112.b41896.c330995.d367632', { manageType: 'recyleBin' });
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
