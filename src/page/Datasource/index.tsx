import PageContainer, { TitleType } from '@/component/PageContainer';
import { EllipsisOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@umijs/max';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history, useParams } from 'umi';
import Info from './Info';
import Recycle from './Recycle';
import Session from './Session';

import {
  deleteConnection,
  getConnectionDetail,
  getConnectionList,
} from '@/common/network/connection';
import { IDatasource } from '@/d.ts/datasource';
import { IPageType } from '@/d.ts/_index';
import { useRequest } from 'ahooks';
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
  const cid = parseInt(id);

  const activeKeys = useRef<Set<string>>(new Set());
  activeKeys.current.add(page);

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

  const { data } = useRequest(getConnectionList, {
    defaultParams: [
      {
        page: 1,
        size: 10,
      },
    ],
  });

  const options = [
    {
      label: connection?.name,
      value: cid,
    },
  ].concat(
    data?.contents
      ?.map((c) => {
        if (c.id === cid) {
          return null;
        }
        return {
          label: c.name,
          value: c.id,
        };
      })
      ?.filter(Boolean) || [],
  );

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
      {Object.entries(Pages)
        .map(([key, Page]) => {
          if (activeKeys.current.has(key) || key === page) {
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'auto',
                  padding: '12px 24px',
                  zIndex: key === page ? 'unset' : -999,
                }}
              >
                <Page.component key={id} id={id} />
              </div>
            );
          }
        })
        .filter(Boolean)}
    </PageContainer>
  );
};

export default Index;
