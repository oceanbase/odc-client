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

import { getFirstEnabledTask } from '@/component/Task/helper';
import HelpItem from '@/layout/SpaceContainer/Sider/HelpItem';
import MenuItem from '@/layout/SpaceContainer/Sider/MenuItem';
import MineItem from '@/layout/SpaceContainer/Sider/MineItem';
import SpaceSelect from '@/layout/SpaceContainer/Sider/SpaceSelect';
import { openTasksPage } from '@/store/helper/page';
import DBSvg from '@/svgr/database_outline.svg';
import TaskSvg from '@/svgr/icon_task.svg';
import ManagerSvg from '@/svgr/operate.svg';
import CodeSvg from '@/svgr/Snippet.svg';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { BulbOutlined, UserOutlined } from '@ant-design/icons';
import { Divider, Space } from 'antd';
import React, { useContext } from 'react';
import ActivityBarContext from '../context/ActivityBarContext';
import ActivityBarButton from './ActivityBarButton';
import styles from './index.less';
import Logo from './Logo';
import { ActivityBarItemType, ActivityBarItemTypeText } from './type';

interface IProps {}

interface IItem {
  title: string;
  key: ActivityBarItemType;
  icon: React.ComponentType;
  isVisible?: boolean;
}

const ActivityBar: React.FC<IProps> = function () {
  const context = useContext(ActivityBarContext);
  const items: IItem[] = [
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Database],
      key: ActivityBarItemType.Database,
      icon: DBSvg,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Script],
      key: ActivityBarItemType.Script,
      icon: CodeSvg,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Task],
      key: ActivityBarItemType.Task,
      icon: TaskSvg,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Manager],
      key: ActivityBarItemType.Manager,
      icon: ManagerSvg,
      isVisible: true,
    },
  ];
  return (
    <div className={styles.bar}>
      <div className={styles.top}>
        <Logo />
        {!isClient() && (
          <>
            <SpaceSelect collapsed={true} />
            <Divider style={{ marginTop: 6, marginBottom: 12 }} />
          </>
        )}

        <Space size={12} direction="vertical">
          {items
            .filter((item) => item.isVisible)
            .map((item, index) => {
              return (
                <ActivityBarButton
                  key={item.key}
                  title={item.title}
                  icon={item.icon}
                  isActive={context?.activeKey === item.key}
                  onClick={() => {
                    if (item.key === context.activeKey) {
                      context.setActiveKey(null);
                      return;
                    }
                    if (item.key === ActivityBarItemType.Task) {
                      const firstEnabledTask = getFirstEnabledTask();
                      if (firstEnabledTask) {
                        openTasksPage(firstEnabledTask?.value);
                      }
                    }
                    context?.setActiveKey(item.key);
                  }}
                />
              );
            })}
        </Space>
      </div>
      <div className={styles.bottom}>
        <Space size={12} direction="vertical">
          <HelpItem>
            <MenuItem
              disableTip={true}
              icon={BulbOutlined}
              collapsed={true}
              label={formatMessage({ id: 'odc.Index.Sider.Help' })} /*帮助*/
            />
          </HelpItem>
          <MineItem enableTheme={true}>
            <MenuItem
              disableTip={true}
              icon={UserOutlined}
              collapsed={true}
              label={formatMessage({ id: 'odc.Index.Sider.Mine' })} /*我的*/
            />
          </MineItem>
        </Space>
      </div>
    </div>
  );
};

export default ActivityBar;
