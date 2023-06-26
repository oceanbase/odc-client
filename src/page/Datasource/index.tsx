import PageContainer, { TitleType } from '@/component/PageContainer';
import { EllipsisOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@umijs/max';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { history, useParams } from 'umi';
import Info from './Info';
import Recycle from './Recycle';
import Session from './Session';

import { deleteConnection, getConnectionDetail } from '@/common/network/connection';
import { IDatasource } from '@/d.ts/datasource';
import { IPageType } from '@/d.ts/_index';
import { isNumber } from 'lodash';
import OBClientPage from './OBClient';

const ExtraContent = ({ cid }: { cid: number }) => {
  const nav = useNavigate();
  return (
    <Space>
      <Dropdown.Button
        menu={{
          items: [
            {
              label: '删除',
              key: 'delete',
              async onClick() {
                Modal.confirm({
                  title: '确认删除吗？',
                  async onOk() {
                    const isSuccess = await deleteConnection(cid?.toString());
                    if (isSuccess) {
                      message.success('删除成功');
                      nav('/datasource');
                    }
                  },
                });
              },
            },
          ],
        }}
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
  [IPageType.Datasource_obclient]: {
    component: OBClientPage,
  },
};

const tabs = [
  {
    tab: '数据库',
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
  {
    tab: '命令行窗口',
    key: IPageType.Datasource_obclient,
  },
];

const Index: React.FC<IProps> = function () {
  const params = useParams<{ id: string; page: IPageType }>();
  const { id, page } = params;
  const Component = Pages[page].component;
  const cid = parseInt(id);

  const handleChange = (key: string) => {
    history.push(`/datasource/${id}/${key}`);
  };

  const handleSelectChange = (value: string) => {
    history.push(`/datasource/${value}/${page}`);
  };

  const [connection, setConnection] = useState<IDatasource>(null);

  async function fetchDatasource(cid: number) {
    const data = await getConnectionDetail(cid);
    if (data) {
      setConnection(data);
    }
  }
  const reloadDatasource = useCallback(() => {
    fetchDatasource(cid);
  }, [cid]);

  useEffect(() => {
    if (isNumber(cid)) {
      fetchDatasource(cid);
    }
  }, [cid]);

  const options = [
    {
      label: connection?.name,
      value: cid,
    },
  ];

  return (
    <PageContainer
      titleProps={{
        type: TitleType.SELECT,
        defaultValue: cid,
        options: options,
        onChange: handleSelectChange,
      }}
      tabList={tabs}
      tabActiveKey={page}
      tabBarExtraContent={<ExtraContent cid={cid} />}
      onTabChange={handleChange}
      bigSelectBottom={<Link to={'/datasource'}>查看所有数据源</Link>}
    >
      <Component id={id} />
    </PageContainer>
  );
};

export default Index;
