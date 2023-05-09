import PageContainer, { TitleType } from '@/component/PageContainer';
import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
import React from 'react';
import { history, useParams } from 'umi';
import Database from './Database';
import Setting from './Setting';
import Task from './Task';
import User from './User';

import { IPageType } from '@/d.ts/_index';

const data = Array(10)
  ?.fill(0)
  ?.map((item, index) => `项目 ${index + 1}`);
const options = data?.map((item, index) => ({
  label: item,
  value: index + 1,
}));

const menu = (
  <Menu>
    <Menu.Item>菜单项一</Menu.Item>
    <Menu.Item>菜单项二</Menu.Item>
  </Menu>
);

const ExtraContent = () => {
  return (
    <Space size={12}>
      <Button type="primary">登录数据库</Button>
      <Dropdown.Button
        overlay={menu}
        buttonsRender={() => [null, <Button icon={<EllipsisOutlined />} />]}
      />
    </Space>
  );
};

interface IProps {}

const Pages = {
  [IPageType.Project_Database]: {
    component: Database,
  },
  [IPageType.Project_Setting]: {
    component: Setting,
  },
  [IPageType.Project_Task]: {
    component: Task,
  },
  [IPageType.Project_User]: {
    component: User,
  },
};

const tabs = [
  {
    tab: '数据库',
    key: IPageType.Project_Database,
  },
  {
    tab: '工单',
    key: IPageType.Project_Task,
  },
  {
    tab: '成员',
    key: IPageType.Project_User,
  },
  {
    tab: '设置',
    key: IPageType.Project_Setting,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/project/${id}/${key}`);
  };

  const handleProjectChange = (value: string) => {
    history.push(`/project/${value}/${page}`);
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.SELECT,
        defaultValue: Number(params?.id),
        options: options,
        onChange: handleProjectChange,
      }}
      tabList={tabs}
      tabActiveKey={page}
      tabBarExtraContent={<ExtraContent />}
      onTabChange={handleChange}
    >
      <Component id={id} />
    </PageContainer>
  );
};

export default Index;
