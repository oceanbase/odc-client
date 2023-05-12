import PageContainer, { TitleType } from '@/component/PageContainer';
import { EllipsisOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { Button, Dropdown, Menu, Space } from 'antd';
import React from 'react';
import { history, useParams } from 'umi';
import Info from './Info';
import Recycle from './Recycle';
import Session from './Session';

import { IPageType } from '@/d.ts/_index';

const data = Array(10)
  ?.fill(0)
  ?.map((item, index) => `source ${index + 1}`);
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
    <Space>
      <Button>命令行窗口</Button>
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
  [IPageType.Datasource_info]: {
    component: Info,
  },
  [IPageType.Datasource_recycle]: {
    component: Recycle,
  },
  [IPageType.Datasource_session]: {
    component: Session,
  },
};

const tabs = [
  {
    tab: '基本信息',
    key: IPageType.Datasource_info,
  },
  {
    tab: '会话',
    key: IPageType.Datasource_session,
  },
  {
    tab: '回收站',
    key: IPageType.Datasource_recycle,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;

  const handleChange = (key: string) => {
    history.push(`/datasource/${id}/${key}`);
  };

  const handleSelectChange = (value: string) => {
    history.push(`/datasource/${value}/${page}`);
  };

  return (
    <PageContainer
      titleProps={{
        type: TitleType.SELECT,
        defaultValue: Number(params?.id),
        options: options,
        onChange: handleSelectChange,
      }}
      tabList={tabs}
      tabActiveKey={page}
      tabBarExtraContent={<ExtraContent />}
      onTabChange={handleChange}
      bigSelectBottom={<Link to={'/datasource'}>查看所有数据源</Link>}
    >
      <Component id={id} />
    </PageContainer>
  );
};

export default Index;
