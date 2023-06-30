import PageContainer, { TitleType } from '@/component/PageContainer';
import { IPageType } from '@/d.ts/_index';
import React from 'react';
import { history, useParams } from 'umi';
import Autoauth from './Autoauth';
import Role from './Role';
import User from './User';

interface IProps {}

const Pages = {
  [IPageType.Auth_User]: {
    component: User,
  },
  [IPageType.Auth_Role]: {
    component: Role,
  },
  [IPageType.Auth_Autoauth]: {
    component: Autoauth,
  },
};

const tabs = [
  {
    tab: '用户',
    key: IPageType.Auth_User,
  },
  {
    tab: '角色',
    key: IPageType.Auth_Role,
  },
  {
    tab: '自动授权',
    key: IPageType.Auth_Autoauth,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/auth/${key}`);
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '用户权限',
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
