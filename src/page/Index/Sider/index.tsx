import { formatMessage } from '@/util/intl';
import Icon, {
  BulbOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Divider, Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Link, useParams } from 'umi';
import { IPageType } from '../type';

import { AcessResult, withSystemAcess } from '@/component/Acess';
import LinkOutlined from '@/svgr/icon_connection.svg';
import ManageSvg from '@/svgr/icon_dashboard.svg';
import TaskSvg from '@/svgr/icon_task.svg';
import { isClient } from '@/util/env';
import HelpItem from './HelpItem';
import styles from './index.less';
import Logo from './Logo';
import MenuItem from './MenuItem';
import MineItem from './MineItem';

interface IProps {}

const SystemManageEntry = withSystemAcess(
  ({ accessible, systemPages, collapsed }: Partial<AcessResult & { collapsed: boolean }>) => {
    if (!accessible) return null;
    const pageKey = Object.keys(systemPages).find((key) => systemPages[key]);
    return (
      <Link to={`/manage/${pageKey}`}>
        <MenuItem
          icon={ManageSvg}
          collapsed={collapsed}
          label={formatMessage({
            id: 'odc.Index.Sider.ControlDesk',
          })} /*管控台*/
        />
      </Link>
    );
  },
);

const Sider: React.FC<IProps> = function () {
  const [collapsed, setCollapsed] = useState(false);
  const params = useParams<{ page: string }>();
  const selected = params?.page;
  const mentItemGap = collapsed ? 12 : 12;
  return (
    <div
      className={classNames(styles.sider, {
        [styles.siderCollapsed]: collapsed,
      })}
    >
      <div>
        <Logo collapsed={collapsed} />
        <Space
          size={mentItemGap}
          direction="vertical"
          className={styles.menu1}
          style={{ width: '100%' }}
        >
          <Link to={`/index/${IPageType.Connection}`}>
            <MenuItem
              key={IPageType.Connection}
              selected={selected === IPageType.Connection}
              icon={LinkOutlined}
              collapsed={collapsed}
              label={formatMessage({
                id: 'odc.Index.Sider.Connection',
              })} /*连接*/
            />
          </Link>
          <Link to={`/index/${IPageType.History}`}>
            <MenuItem
              key={IPageType.History}
              selected={selected === IPageType.History}
              icon={ClockCircleOutlined}
              collapsed={collapsed}
              label={formatMessage({ id: 'odc.Index.Sider.History' })} /*历史*/
            />
          </Link>
          <Link to={`/index/${IPageType.Task}`}>
            <MenuItem
              key={IPageType.Task}
              selected={selected === IPageType.Task}
              icon={TaskSvg}
              collapsed={collapsed}
              label={formatMessage({ id: 'odc.Index.Sider.Task' })} /*任务*/
            />
          </Link>
        </Space>
        {!isClient() && (
          <>
            <Divider style={{ margin: collapsed ? '6px 0px' : '8px 0px' }} />
            <div className={styles.menu2}>
              <SystemManageEntry collapsed={collapsed} />
            </div>
          </>
        )}
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
