import PageContainer, { TitleType } from '@/component/PageContainer';
import { IPageType } from '@/d.ts/_index';
import React from 'react';
import { history, useParams } from 'umi';
import ExternalIntegration_1 from './ExternalIntegration_1';
import ExternalIntegration_2 from './ExternalIntegration_2';

interface IProps {}

const Pages = {
  [IPageType.ExternalIntegration_1]: {
    component: ExternalIntegration_1,
  },
  [IPageType.ExternalIntegration_2]: {
    component: ExternalIntegration_2,
  },
};

const tabs = [
  {
    tab: '外部集成-1',
    key: IPageType.ExternalIntegration_1,
  },
  {
    tab: '外部集成-2',
    key: IPageType.ExternalIntegration_2,
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
        title: '外部集成',
      }}
      tabList={tabs}
      tabActiveKey={page}
      onTabChange={handleChange}
    >
      <Component id={id} />
    </PageContainer>
  );
};

export default Index;
