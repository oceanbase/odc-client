import PageContainer, { TitleType } from '@/component/PageContainer';
import { IPageType } from '@/d.ts/_index';
import React from 'react';
import { history, useParams } from 'umi';
import Approval from './Approval';
import Env from './Env';
import Record from './Record';

interface IProps {}

const Pages = {
  [IPageType.Secure_Approval]: {
    component: Approval,
  },
  [IPageType.Secure_Env]: {
    component: Env,
  },
  [IPageType.Secure_Record]: {
    component: Record,
  },
};

const tabs = [
  {
    tab: '环境',
    key: IPageType.Secure_Env,
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

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/secure/${key}`);
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '安全规范',
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
