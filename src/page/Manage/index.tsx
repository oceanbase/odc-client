import {
  getPublicConnectionList,
  getResourceGroupList,
  getRoleList,
  getUserList,
} from '@/common/network/manager';
import {
  canAcess,
  systemCreatePermissions,
  systemReadPermissions,
  useAcess,
} from '@/component/Acess';
import appConfig from '@/constant/appConfig';
import type {
  ConnectionMode,
  IManagerPublicConnection,
  IManagerResourceGroup,
  IManagerRole,
  IManagerUser,
  IManageUserListParams,
  IResponseData,
} from '@/d.ts';
import { actionTypes, IManagePagesKeys, IManagerResourceType } from '@/d.ts';
import MaskDataPage from '@/page/Project/Setting/Algorithm';
import type { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import resourceIcon from '@/svgr/resource.svg';
import SecurityAuditIcon from '@/svgr/security-audit.svg';
import SourceSvg from '@/svgr/Source.svg';
import taskFlowIcon from '@/svgr/taskFlow.svg';
import { formatMessage } from '@/util/intl';
import Icon, { SettingOutlined, SwapLeftOutlined } from '@ant-design/icons';
import { useLocation } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Layout, Menu, Space } from 'antd';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import AutoAuthPage from './components/AutoAuthPage';
import IndexPage from './components/IndexPage';
import PublicConnection from './components/PublicConnectionPage';
import RecordPage from './components/RecordPage';
import ResourceGroup from './components/ResourceGroupPage';
import RolePage from './components/RolePage';
import SystemConfigPage from './components/SystemConfigPage';
import TaskFlowPage from './components/TaskFlowPage';
import UserPage from './components/UserPage';
import { ManageContext } from './context';
import styles from './index.less';

export function hasSourceWriteAuth(auths: string[] = []) {
  return auths?.includes(actionTypes.writeAndReadConnect);
}

export function hasSourceReadAuth(auths: string[] = []) {
  return auths?.includes(actionTypes.readonlyconnect) && !hasSourceWriteAuth(auths);
}

export function hasSourceApplyAuth(auths: string[] = []) {
  return auths?.includes(actionTypes.apply);
}

export function hasSourceAuth(auths: string[] = []) {
  return hasSourceWriteAuth(auths) || hasSourceReadAuth(auths);
}

export const sourceAuthMap = {
  [actionTypes.writeAndReadConnect]: {
    hasSourceAuth: hasSourceWriteAuth,
    title: formatMessage({ id: 'odc.page.Manage.ReadWrite' }), //读写
    value: actionTypes.writeAndReadConnect,
  },

  [actionTypes.readonlyconnect]: {
    hasSourceAuth: hasSourceReadAuth,
    title: formatMessage({ id: 'odc.page.Manage.ReadOnly' }), //只读
    value: actionTypes.readonlyconnect,
  },

  [actionTypes.apply]: {
    hasSourceAuth: hasSourceApplyAuth,
    title: formatMessage({ id: 'odc.page.Manage.CanApply' }), //可申请
    value: actionTypes.apply,
  },
};

export function getSourceAuthLabels(auths: string[] = []) {
  const labels = [];
  if (hasSourceWriteAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.writeAndReadConnect]);
  }
  if (hasSourceReadAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.readonlyconnect]);
  }
  if (hasSourceApplyAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.apply]);
  }
  return labels.map((item) => item.title);
}

export function getSourceAuthLabelString(auths: string[] = []) {
  const label = getSourceAuthLabels(auths)?.join(', ');
  return label || '-';
}

export function getSourceAuthOptions() {
  return Object.values(sourceAuthMap).map(({ title, value }) => {
    return {
      title,
      value,
    };
  });
}

// 330 版本不支持 安全审计
const enabledSecurityAudit = false;

const rootSubmenuKeys = [IManagePagesKeys.PUBLIC_RESOURCE_MANAGE];

const ResourceManageMenu = inject(
  'settingStore',
  'userStore',
)(
  observer(
    ({
      settingStore,
      userStore,
      ...props
    }: MenuProps & { settingStore?: SettingStore; userStore?: UserStore }) => {
      const [openKeys, setOpenKeys] = React.useState([IManagePagesKeys.PUBLIC_RESOURCE_MANAGE]);
      const isAdmin = () => {
        return userStore?.user?.roles?.some((item) => item.type === 'ADMIN');
      };

      const onOpenChange = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
          setOpenKeys(keys);
        } else {
          setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
      };

      const { accessible: canReadConnection } = useAcess(
        systemReadPermissions[IManagerResourceType.public_connection],
      );
      const { accessible: canCreateConnection } = useAcess(
        systemCreatePermissions[IManagerResourceType.public_connection],
      );
      const { accessible: canReadResourceGroup } = useAcess(
        systemReadPermissions[IManagerResourceType.resource_group],
      );
      const { accessible: canCreateResourceGroup } = useAcess(
        systemCreatePermissions[IManagerResourceType.resource_group],
      );

      const { accessible: canReadUser } = useAcess(
        systemReadPermissions[IManagerResourceType.user],
      );
      const { accessible: canCreateUser } = useAcess(
        systemCreatePermissions[IManagerResourceType.user],
      );

      const { accessible: canReadRole } = useAcess(
        systemReadPermissions[IManagerResourceType.role],
      );
      const { accessible: canCreateRole } = useAcess(
        systemCreatePermissions[IManagerResourceType.role],
      );

      const { accessible: canReadDataMasking } = useAcess(
        systemReadPermissions[IManagerResourceType.odc_data_masking_rule],
      );

      const { accessible: canReadSystemConfig } = useAcess(
        systemReadPermissions[IManagerResourceType.system_config],
      );

      const { accessible: canReadFlowConfig } = useAcess(
        systemReadPermissions[IManagerResourceType.flow_config],
      );

      const { accessible: recordAccessible } = useAcess(
        systemReadPermissions[IManagerResourceType.odc_audit_event],
      );

      const canReadRecord = recordAccessible && appConfig.manage.record.enable?.(settingStore);
      let resourceManageMenu = null;
      let securityAuditMenu = null;
      const canAccessConnection = canReadConnection || canCreateConnection;
      const canAccessResourceGroup = canReadResourceGroup || canCreateResourceGroup;
      const canAccessUser = canReadUser || canCreateUser;
      const canAccessRole = canReadRole || canCreateRole;
      if (canAccessConnection || canAccessResourceGroup || canAccessUser || canAccessRole) {
        resourceManageMenu = (
          <Menu.SubMenu
            title={formatMessage({
              id: 'odc.page.Manage.ResourcePermissions',
            })}
            /*资源权限*/
            icon={<Icon className={styles.icon} component={resourceIcon} />}
            key={IManagePagesKeys.PUBLIC_RESOURCE_MANAGE}
          >
            {canAccessConnection && (
              <Menu.Item key={IManagePagesKeys.CONNECTION}>
                {
                  formatMessage({
                    id: 'odc.page.Manage.PublicConnection',
                  })
                  /*公共连接*/
                }
              </Menu.Item>
            )}

            {canAccessResourceGroup && (
              <Menu.Item key={IManagePagesKeys.RESOURCE}>
                {
                  formatMessage({
                    id: 'odc.page.Manage.ResourceGroup',
                  }) /*资源组*/
                }
              </Menu.Item>
            )}

            {canAccessRole && (
              <Menu.Item key={IManagePagesKeys.ROLE}>
                {formatMessage({ id: 'odc.page.Manage.Role' }) /*角色*/}
              </Menu.Item>
            )}

            {canAccessUser && (
              <Menu.Item key={IManagePagesKeys.USER}>
                {formatMessage({ id: 'odc.page.Manage.User' }) /*用户*/}
              </Menu.Item>
            )}

            {isAdmin() && settingStore.enableAuthRule && (
              <Menu.Item key={IManagePagesKeys.AUTO_AUTH}>
                {
                  formatMessage({
                    id: 'odc.page.Manage.AutomaticAuthorizationRules',
                  }) /*自动授权规则*/
                }
              </Menu.Item>
            )}
          </Menu.SubMenu>
        );
      }

      if (canReadDataMasking || canReadRecord) {
        securityAuditMenu = (
          <Menu.SubMenu
            title={formatMessage({
              id: 'odc.page.Manage.SecurityAudit',
            })}
            /*安全审计*/
            icon={<Icon component={SecurityAuditIcon} className={styles.icon} />}
            key={IManagePagesKeys.SECURITY_AUDIT}
          >
            <Menu.Item key={IManagePagesKeys.MASK_DATA}>
              {
                formatMessage({
                  id: 'odc.components.MaskDataPage.DesensitizationRules',
                }) //脱敏规则
              }
            </Menu.Item>
            {enabledSecurityAudit && (
              <Menu.Item key={IManagePagesKeys.RISK_DATA}>
                {formatMessage({ id: 'odc.page.Manage.RiskData' }) /*风险数据*/}
              </Menu.Item>
            )}

            {canReadRecord ? (
              <Menu.Item key={IManagePagesKeys.RECORD}>
                {
                  formatMessage({
                    id: 'odc.page.Manage.OperationRecords',
                  }) /*操作记录*/
                }
              </Menu.Item>
            ) : null}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu {...props} openKeys={openKeys} onOpenChange={onOpenChange}>
          <Menu.Item
            key={IManagePagesKeys.INDEX}
            icon={<Icon component={SourceSvg} className={styles.icon} />}
          >
            {formatMessage({ id: 'odc.page.Manage.QuickStart' }) /*快速入门*/}
          </Menu.Item>
          {resourceManageMenu}
          {canReadFlowConfig ? (
            <Menu.Item
              icon={<Icon className={styles.icon} component={taskFlowIcon} />}
              key={IManagePagesKeys.TASK_FLOW}
            >
              {formatMessage({ id: 'odc.page.Manage.TaskFlow' }) /*任务流程*/}
            </Menu.Item>
          ) : null}
          {securityAuditMenu}
          {canReadSystemConfig && (
            <Menu.Item
              icon={<SettingOutlined className={styles.icon} />}
              key={IManagePagesKeys.SYSTEM_CONFIG}
            >
              {
                formatMessage({
                  id: 'odc.page.Manage.SystemSettings',
                })

                /* 系统设置 */
              }
            </Menu.Item>
          )}
        </Menu>
      );
    },
  ),
);

const { Sider, Content } = Layout;
interface IProps {
  userStore?: UserStore;
}

interface IState {
  openKeys: string[];
  activeKey: IManagePagesKeys;
  users: IResponseData<IManagerUser>;
  roles: Map<number, IManagerRole>;
  publicConnections: IResponseData<IManagerPublicConnection>;
  resourceGroups: IResponseData<IManagerResourceGroup>;
}

const Pages = {
  [IManagePagesKeys.INDEX]: {
    component: IndexPage,
  },

  [IManagePagesKeys.USER]: {
    component: UserPage,
  },

  [IManagePagesKeys.ROLE]: {
    component: RolePage,
  },

  [IManagePagesKeys.CONNECTION]: {
    component: PublicConnection,
  },

  [IManagePagesKeys.RESOURCE]: {
    component: ResourceGroup,
  },

  [IManagePagesKeys.AUTO_AUTH]: {
    component: AutoAuthPage,
  },

  [IManagePagesKeys.TASK_FLOW]: {
    component: TaskFlowPage,
  },

  [IManagePagesKeys.RECORD]: {
    component: RecordPage,
  },

  [IManagePagesKeys.SYSTEM_CONFIG]: {
    component: SystemConfigPage,
  },

  [IManagePagesKeys.MASK_DATA]: {
    component: MaskDataPage,
  },
};

const Manage: React.FC<IProps> = (props: IProps) => {
  const { pathname } = useLocation();
  const pathnameArray = pathname.split('/');
  const lastPathname = pathnameArray?.[-1] || pathnameArray[pathnameArray.length - 1];
  const initActiveKey = lastPathname as IManagePagesKeys;
  const [openKeys, setOpenKeys] = useState<string[]>(
    [IManagePagesKeys.CONNECTION, IManagePagesKeys.RESOURCE].includes(initActiveKey)
      ? [IManagePagesKeys.PUBLIC_RESOURCE_MANAGE]
      : [IManagePagesKeys.MEMBER_MANAGE],
  );
  const [activeKey, setActivekey] = useState<IManagePagesKeys>(
    initActiveKey ? initActiveKey : IManagePagesKeys.USER,
  );
  const [users, setUsers] = useState<IResponseData<IManagerUser>>(null);
  const [roles, setRoles] = useState<Map<number, IManagerRole>>(new Map());
  const [publicConnections, setPublicConnections] =
    useState<IResponseData<IManagerPublicConnection>>(null);
  const [resourceGroups, setResourceGroups] = useState<IResponseData<IManagerResourceGroup>>(null);
  const PageContent = Pages[activeKey].component;

  const _getUserList = async (params: IManageUserListParams) => {
    const users = await getUserList(params);
    setUsers(users);
  };

  const _getRoleList = async (params?: IManageUserListParams) => {
    const data = await getRoleList(params);
    const roles: [number, IManagerRole][] = data?.contents?.map((item) => [item.id, item]);
    setRoles(new Map(roles));
  };

  const _updateRoleById = async (data: IManagerRole) => {
    const newRoles = new Map(roles);
    newRoles.set(data.id, data);
    setRoles(newRoles);
  };

  const _getPublicConnectionList = async (params?: {
    name?: string;
    enabled?: boolean[];
    dialectType?: ConnectionMode[];
    resourceGroupId?: number[];
  }) => {
    const publicConnections = await getPublicConnectionList(params);
    setPublicConnections(publicConnections);
  };

  const _getResourceGroupList = async () => {
    const resourceGroups = await getResourceGroupList();
    setResourceGroups(resourceGroups);
  };

  const handleMenuChange = (keys) => {
    const latestKey = keys.find((key) => !openKeys.includes(key));
    setOpenKeys(latestKey ? [latestKey] : []);
  };

  const handleMenuClick = (e) => {
    setActivekey(e.key);

    history.push(`/manage/${e.key}`);
  };

  const handleBack = () => {
    history.push('/connections');
  };

  const checkAndLogin = async () => {
    const { userStore } = props;
    if (!userStore.haveUserInfo()) {
      return false;
    }
    return true;
  };
  useEffect(() => {
    async function asyncEffect() {
      const isLogin = await checkAndLogin();
      const canAcessRole = canAcess({
        resourceIdentifier: IManagerResourceType.role,
        action: 'read',
      }).accessible;
      if (isLogin) {
        if (canAcessRole) {
          _getRoleList();
        }
        _getPublicConnectionList();
        _getResourceGroupList();
      }
    }
    asyncEffect();
  }, []);
  return (
    <Layout className={styles.manage}>
      <Content className={styles.wrapperContent}>
        <Layout>
          <Sider>
            <div className={styles.headerback} onClick={handleBack}>
              <Space className={styles.btn}>
                <SwapLeftOutlined />
                <span>
                  {
                    formatMessage({
                      id: 'odc.page.Manage.ExitTheConsole',
                    })

                    /*退出管控台*/
                  }
                </span>
              </Space>
            </div>
            <ResourceManageMenu
              mode="inline"
              openKeys={openKeys}
              onOpenChange={handleMenuChange}
              onClick={handleMenuClick}
              selectedKeys={[activeKey]}
            />
          </Sider>
          <Content className={styles.content}>
            <div
              className={classnames(styles.main, {
                [styles.bg]: activeKey !== IManagePagesKeys.INDEX,
              })}
            >
              <ManageContext.Provider
                value={{
                  users,
                  roles,
                  publicConnections,
                  resourceGroups,
                  activeMenuKey: activeKey,
                  getUserList: _getUserList,
                  getRoleList: _getRoleList,
                  updateRoleById: _updateRoleById,
                  getPublicConnectionList: _getPublicConnectionList,
                  getResourceGroupList: _getResourceGroupList,
                }}
              >
                <PageContent />
              </ManageContext.Provider>
            </div>
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
};
export default inject('userStore')(observer(Manage));
