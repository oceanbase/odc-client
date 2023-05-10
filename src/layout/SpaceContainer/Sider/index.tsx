import { IPageType } from '@/d.ts/_index';
import LinkOutlined from '@/svgr/icon_connection.svg';
import TaskSvg from '@/svgr/icon_task.svg';
import { formatMessage } from '@/util/intl';
import Icon, {
  AppstoreOutlined,
  BulbOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  ControlOutlined,
  ForkOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Divider, Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Link, useLocation } from 'umi';
import HelpItem from './HelpItem';
import styles from './index.less';
import Logo from './Logo';
import MenuItem from './MenuItem';
import MineItem from './MineItem';
import SpaceSelect from './SpaceSelect';

interface IProps {}

const Sider: React.FC<IProps> = function () {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const selected = location?.pathname?.split('/')[1];
  const mentItemGap = collapsed ? 12 : 12;
  return (
    <div
      className={classNames(styles.sider, {
        [styles.siderCollapsed]: collapsed,
      })}
    >
      <div>
        <Logo collapsed={collapsed} />
        <SpaceSelect collapsed={collapsed} />
        <Divider style={{ margin: '0 0 14px' }} />
        <Space
          size={mentItemGap}
          direction="vertical"
          className={styles.menu1}
          style={{ width: '100%' }}
        >
          <Link to={`/${IPageType.Project}`}>
            <MenuItem
              key={IPageType.Project}
              selected={selected === IPageType.Project}
              icon={AppstoreOutlined}
              collapsed={collapsed}
              label="项目"
            />
          </Link>
          <Link to={`/${IPageType.Datasource}`}>
            <MenuItem
              key={IPageType.Datasource}
              selected={selected === IPageType.Datasource}
              icon={LinkOutlined}
              collapsed={collapsed}
              label="数据源"
            />
          </Link>
          <Link to={`/${IPageType.Task}`}>
            <MenuItem
              key={IPageType.Task}
              selected={selected === IPageType.Task}
              icon={TaskSvg}
              collapsed={collapsed}
              label="工单"
            />
          </Link>
          <Link to={`/${IPageType.Auth}/${IPageType.Auth_User}`}>
            <MenuItem
              key={IPageType.Auth}
              selected={selected === IPageType.Auth}
              icon={TeamOutlined}
              collapsed={collapsed}
              label="用户权限"
            />
          </Link>
          <Link to={`/${IPageType.Secure}/${IPageType.Secure_Env}`}>
            <MenuItem
              key={IPageType.Secure}
              selected={selected === IPageType.Secure}
              icon={ControlOutlined}
              collapsed={collapsed}
              label="安全规范"
            />
          </Link>
          <Link to={`/${IPageType.ExternalIntegration}/${IPageType.ExternalIntegration_1}`}>
            <MenuItem
              key={IPageType.ExternalIntegration}
              selected={selected === IPageType.ExternalIntegration}
              icon={ForkOutlined}
              collapsed={collapsed}
              label="外部集成"
            />
          </Link>
        </Space>
      </div>
      <Space size={mentItemGap} direction="vertical" className={styles.bottom}>
        <HelpItem>
          <MenuItem
            disableTip={true}
            icon={BulbOutlined}
            collapsed={collapsed}
            label={formatMessage({ id: 'odc.Index.Sider.Help' })} /*帮助*/
          />
        </HelpItem>
        <MineItem>
          <MenuItem
            disableTip={true}
            icon={UserOutlined}
            collapsed={collapsed}
            label={formatMessage({ id: 'odc.Index.Sider.Mine' })} /*我的*/
          />
        </MineItem>
      </Space>
      <div className={styles.collapsedBtn} onClick={() => setCollapsed(!collapsed)}>
        <Icon component={collapsed ? CaretRightOutlined : CaretLeftOutlined} />
      </div>
    </div>
  );
};

export default Sider;
