import {
  AppstoreFilled,
  BulbOutlined,
  CodeFilled,
  DatabaseFilled,
  ToolFilled,
  UserOutlined,
} from '@ant-design/icons';
import React, { useContext } from 'react';

import HelpItem from '@/layout/SpaceContainer/Sider/HelpItem';
import MenuItem from '@/layout/SpaceContainer/Sider/MenuItem';
import MineItem from '@/layout/SpaceContainer/Sider/MineItem';
import { formatMessage } from '@/util/intl';
import { Space } from 'antd';
import ActivityBarButton from './ActivityBarButton';
import ActivityBarContext from './ActivityBarContext';
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
      icon: DatabaseFilled,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Script],
      key: ActivityBarItemType.Script,
      icon: CodeFilled,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Job],
      key: ActivityBarItemType.Job,
      icon: AppstoreFilled,
      isVisible: true,
    },
    {
      title: ActivityBarItemTypeText[ActivityBarItemType.Manager],
      key: ActivityBarItemType.Manager,
      icon: ToolFilled,
      isVisible: true,
    },
  ];
  return (
    <div className={styles.bar}>
      <div className={styles.top}>
        <Logo />
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
                    context?.onChangeActiveKey(item.key);
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
          <MineItem>
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
