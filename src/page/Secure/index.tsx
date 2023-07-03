import {
  getPublicConnectionList,
  getResourceGroupList,
  getRoleList,
  getUserList,
} from '@/common/network/manager';
import { canAcess } from '@/component/Acess';
import PageContainer, { TitleType } from '@/component/PageContainer';
import {
  IManagePagesKeys,
  IManagerPublicConnection,
  IManagerResourceGroup,
  IManagerResourceType,
  IManagerRole,
  IManagerUser,
  IManageUserListParams,
  IResponseData,
} from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import { useLocation } from '@umijs/max';
import { ConnectionMode } from 'aws-sdk/clients/appflow';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import Approval from './Approval';
import { ManageContext } from './context';
import Env from './Env';
import MaskingAlgorithm from './MaskingAlgorithm';
import Record from './Record';
import RiskDetectRules from './RiskDetectRules';
import RiskLevel from './RiskLevel';

interface IProps {
  userStore?: UserStore;
}

const Pages = {
  [IPageType.Secure_Env]: {
    component: Env, // 环境
  },
  [IPageType.Secure_Record]: {
    component: Record, // 操作记录
  },
  [IPageType.RiskDetectRules]: {
    component: RiskDetectRules, // 风险识别规则
  },
  [IPageType.MaskingAlgorithm]: {
    component: MaskingAlgorithm,
  },
  [IPageType.Secure_Approval]: {
    component: Approval, // 审批流程
  },
  [IPageType.RiskLevel]: {
    component: RiskLevel, // 风险等级
  },
};

const tabs = [
  {
    tab: '环境',
    key: IPageType.Secure_Env,
  },
  {
    tab: '风险等级',
    key: IPageType.RiskLevel,
  },
  {
    tab: '风险识别规则',
    key: IPageType.RiskDetectRules,
  },
  {
    tab: '脱敏算法',
    key: IPageType.MaskingAlgorithm,
  },
  {
    tab: '审批流程',
    key: IPageType.Secure_Approval,
  },
  {
    tab: '操作记录',
    key: IPageType.Secure_Record,
  },
];

const Index: React.FC<IProps> = function ({ userStore }) {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/secure/${key}`);
  };

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
    // @ts-ignore
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
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '安全规范',
      }}
      containerWrapStyle={
        [IPageType.Secure_Env, IPageType.RiskDetectRules].includes(page)
          ? {
              padding: '0px 12px',
            }
          : {}
      }
      tabList={tabs}
      tabActiveKey={page}
      onTabChange={handleChange}
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
        <Component id={id} key={id} />
      </ManageContext.Provider>
    </PageContainer>
  );
};
export default inject('userStore', 'settingStore', 'taskStore', 'modalStore')(observer(Index));
// export default Index;
