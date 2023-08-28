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

import { AccessResourceTypePermission, Acess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import odc from '@/plugins/odc';
import { TaskStore } from '@/store/task';
import LinkOutlined from '@/svgr/icon_connection.svg';
import TaskSvg from '@/svgr/icon_task.svg';
import { isClient } from '@/util/env';
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
import { Link, useLocation } from '@umijs/max';
import { Badge, Divider, Space } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import HelpItem from './HelpItem';
import styles from './index.less';
import Logo from './Logo';
import MenuItem from './MenuItem';
import MineItem from './MineItem';
import SpaceSelect from './SpaceSelect';
import tracert from '@/util/tracert';

interface IProps {
  taskStore?: TaskStore;
}

const Sider: React.FC<IProps> = function (props) {
  const { taskStore } = props;
  const [collapsed, _setCollapsed] = useState(false);
  const location = useLocation();
  const selected = location?.pathname?.split('/')[1];
  const mentItemGap = collapsed ? 12 : 12;
  const _count = taskStore.pendingApprovalInstanceIds?.length ?? 0;
  const count = !isClient() ? _count : 0;

  function setCollapsed(v: boolean) {
    tracert.click(v ? 'a3112.b46782.c330851.d367368' : 'a3112.b46782.c330851.d367367');
    _setCollapsed(v);
  }

  useEffect(() => {
    props.taskStore?.getTaskMetaInfo();
    tracert.expo('a3112.b46782.c330851');
  }, []);

  return (
    <div
      className={classNames(styles.sider, {
        [styles.siderCollapsed]: collapsed,
      })}
    >
      <div>
        <Logo collapsed={collapsed} />
        {isClient() ? null : (
          <>
            <SpaceSelect collapsed={collapsed} />
            <Divider style={{ margin: '0 0 14px' }} />
          </>
        )}

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
              label={formatMessage({ id: 'odc.SpaceContainer.Sider.Project' })} /*项目*/
            />
          </Link>
          <Link to={`/${IPageType.Task}`}>
            <MenuItem
              key={IPageType.Task}
              selected={selected === IPageType.Task}
              icon={TaskSvg}
              collapsed={collapsed}
              showDot={!!count}
              label={
                collapsed ? (
                  formatMessage({ id: 'odc.SpaceContainer.Sider.Ticket' }) /*工单*/
                ) : (
                  <Badge showZero={false} count={count} overflowCount={100} offset={[-8, 5]}>
                    <div style={{ width: '100px' }}>
                      {formatMessage({ id: 'odc.SpaceContainer.Sider.Ticket' }) /*工单*/}
                    </div>
                  </Badge>
                )
              }
            />
          </Link>
          <Link to={`/${IPageType.Datasource}`}>
            <MenuItem
              key={IPageType.Datasource}
              selected={selected === IPageType.Datasource}
              icon={LinkOutlined}
              collapsed={collapsed}
              label={formatMessage({ id: 'odc.SpaceContainer.Sider.DataSource' })} /*数据源*/
            />
          </Link>
          <AccessResourceTypePermission
            permissions={[
              createPermission(IManagerResourceType.user, actionTypes.read),
              createPermission(IManagerResourceType.user, actionTypes.create),
              createPermission(IManagerResourceType.role, actionTypes.read),
              createPermission(IManagerResourceType.role, actionTypes.create),
              createPermission(IManagerResourceType.auto_auth, actionTypes.read),
            ]}
          >
            <Link to={`/${IPageType.Auth}/${IPageType.Auth_User}`}>
              <MenuItem
                key={IPageType.Auth}
                selected={selected === IPageType.Auth}
                icon={TeamOutlined}
                collapsed={collapsed}
                label={formatMessage({
                  id: 'odc.SpaceContainer.Sider.UserPermissions',
                })} /*用户权限*/
              />
            </Link>
          </AccessResourceTypePermission>
          <Link to={`/${IPageType.Secure}/${IPageType.Secure_Env}`}>
            <MenuItem
              key={IPageType.Secure}
              selected={selected === IPageType.Secure}
              icon={ControlOutlined}
              collapsed={collapsed}
              label={formatMessage({
                id: 'odc.SpaceContainer.Sider.SafetySpecifications',
              })} /*安全规范*/
            />
          </Link>
          {odc.appConfig?.manage?.integration?.enable ? (
            <Acess {...createPermission(IManagerResourceType.integration, actionTypes.read)}>
              <Link
                to={`/${IPageType.ExternalIntegration}/${IPageType.ExternalIntegration_Approval}`}
              >
                <MenuItem
                  key={IPageType.ExternalIntegration}
                  selected={selected === IPageType.ExternalIntegration}
                  icon={ForkOutlined}
                  collapsed={collapsed}
                  label={formatMessage({
                    id: 'odc.SpaceContainer.Sider.ExternalIntegration',
                  })} /*外部集成*/
                />
              </Link>
            </Acess>
          ) : null}
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

export default inject('taskStore')(observer(Sider));
