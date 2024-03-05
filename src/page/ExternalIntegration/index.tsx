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

import PageContainer, { TitleType } from '@/component/PageContainer';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import React from 'react';
import { history, useParams } from '@umijs/max';
import SqlInterceptor from './SqlInterceptor';
import SSO from './SSO';

interface IProps {}

const Pages = {
  [IPageType.ExternalIntegration_Approval]: {
    component: SqlInterceptor,
  },
  [IPageType.ExternalIntegration_Sql]: {
    component: SqlInterceptor,
  },
  [IPageType.ExternalIntegration_SSO]: {
    component: SSO,
  },
};

const tabs = [
  {
    tab: formatMessage({ id: 'odc.page.ExternalIntegration.ApprovalIntegration' }), //审批集成
    key: IPageType.ExternalIntegration_Approval,
  },
  {
    tab: formatMessage({ id: 'odc.page.ExternalIntegration.SqlAuditIntegration' }), //SQL 审核集成
    key: IPageType.ExternalIntegration_Sql,
  },
  {
    tab: '登录集成',
    key: IPageType.ExternalIntegration_SSO,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/externalIntegration/${key}`);
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'odc.page.ExternalIntegration.ExternalIntegration' }), //外部集成
      }}
      tabList={tabs}
      tabActiveKey={page}
      onTabChange={handleChange}
    >
      <Component id={id} pageKey={page} />
    </PageContainer>
  );
};

export default Index;
