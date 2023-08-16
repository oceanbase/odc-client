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

import { getUserList } from '@/common/network/manager';
import { canAcess, createPermission } from '@/component/Acess';
import PageContainer, { TitleType } from '@/component/PageContainer';
import {
  actionTypes,
  IManagerResourceType,
  IManagerUser,
  IManageUserListParams,
  IResponseData,
} from '@/d.ts';
import { IPageType } from '@/d.ts/_index';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { history, useParams } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import Approval from './Approval';
import { ManageContext } from './context';
import Env from './Env';
import MaskingAlgorithm from './MaskingAlgorithm';
import Record from './Record';
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
  [IPageType.MaskingAlgorithm]: {
    component: MaskingAlgorithm, // 脱敏算法
  },
  // [IPageType.Secure_Approval]: {
  //   component: Approval, // 审批流程
  // },
  [IPageType.RiskLevel]: {
    component: RiskLevel, // 风险等级
  },
};

const tabs = [
  {
    tab: formatMessage({ id: 'odc.page.Secure.Environment' }), //环境
    key: IPageType.Secure_Env,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.RiskLevel' }), //风险等级
    key: IPageType.RiskLevel,
  },
  // {
  //   tab: formatMessage({ id: 'odc.page.Secure.ApprovalProcess' }), //审批流程
  //   key: IPageType.Secure_Approval,
  // },
  {
    tab: formatMessage({ id: 'odc.page.Secure.DesensitizationAlgorithm' }), //脱敏算法
    key: IPageType.MaskingAlgorithm,
  },
  {
    tab: formatMessage({ id: 'odc.page.Secure.OperationRecord' }), //操作记录
    key: IPageType.Secure_Record,
    permission: createPermission(IManagerResourceType.odc_audit_event, actionTypes.read),
  },
];

const Index: React.FC<IProps> = function ({ userStore }) {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/secure/${key}`);
  };

  const [users, setUsers] = useState<IResponseData<IManagerUser>>(null);
  const _getUserList = async (params: IManageUserListParams) => {
    const users = await getUserList(params);
    setUsers(users);
  };

  const displayTabs = tabs?.filter((tab) =>
    tab.permission ? canAcess(tab.permission)?.accessible : true,
  );

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'odc.page.Secure.SafetySpecifications' }), //安全规范
      }}
      containerWrapStyle={
        [IPageType.Secure_Env, IPageType.RiskLevel].includes(page)
          ? {
              padding: '0px 12px',
            }
          : {}
      }
      tabList={displayTabs}
      tabActiveKey={page}
      onTabChange={handleChange}
    >
      <ManageContext.Provider
        value={{
          users,
          getUserList: _getUserList,
        }}
      >
        <Component id={id} key={id} />
      </ManageContext.Provider>
    </PageContainer>
  );
};
export default inject('userStore', 'settingStore', 'taskStore', 'modalStore')(observer(Index));
