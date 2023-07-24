import PageContainer, { TitleType } from '@/component/PageContainer';
import { IPageType } from '@/d.ts/_index';
import { formatMessage } from '@/util/intl';
import React from 'react';
import { history, useParams } from 'umi';
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
    tab: formatMessage({ id: 'odc.page.ExternalIntegration.SsoIntegration' }), //SSO 集成
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
