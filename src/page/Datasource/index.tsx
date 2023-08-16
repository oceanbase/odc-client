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
import { formatMessage } from '@/util/intl';
import { EllipsisOutlined } from '@ant-design/icons';
import { Link, useNavigate } from '@umijs/max';
import { Button, Dropdown, message, Modal, Space } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history, useParams } from '@umijs/max';
import Info from './Info';
import Recycle from './Recycle';
import Session from './Session';
import {
  deleteConnection,
  getConnectionDetail,
  getConnectionList,
} from '@/common/network/connection';
import { actionTypes } from '@/d.ts';
import { IDatasource } from '@/d.ts/datasource';
import { IPageType } from '@/d.ts/_index';
import setting from '@/store/setting';
import OBSvg from '@/svgr/source_ob.svg';
import { useRequest } from 'ahooks';
import { isNumber } from 'lodash';
import OBClientPage from './OBClient';
const ExtraContent = ({
  cid,
  name,
  permissions,
}: {
  cid: number;
  name: string;
  permissions: actionTypes[];
}) => {
  const nav = useNavigate();
  return (
    <Space>
      <Dropdown.Button
        menu={{
          items: [
            {
              label: formatMessage({
                id: 'odc.page.Datasource.Delete',
              }),
              //删除
              key: 'delete',
              async onClick() {
                Modal.confirm({
                  title: formatMessage(
                    {
                      id: 'odc.page.Datasource.ConfirmToDeleteName',
                    },
                    {
                      name: name,
                    },
                  ),
                  //`是否确认删除 ${name}`
                  content: formatMessage({
                    id: 'odc.src.page.Datasource.AfterDeletingYouWill',
                  }), //'删除后将无法访问该数据源'
                  async onOk() {
                    const isSuccess = await deleteConnection(cid?.toString());
                    if (isSuccess) {
                      message.success(
                        formatMessage({
                          id: 'odc.page.Datasource.DeletedSuccessfully',
                        }), //删除成功
                      );

                      nav('/datasource');
                    }
                  },
                });
              },
              disabled: !permissions?.includes(actionTypes.delete),
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
    tab: formatMessage({
      id: 'odc.page.Datasource.Database',
    }),
    //数据库
    key: IPageType.Datasource_info,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Datasource.Session',
    }),
    //会话
    key: IPageType.Datasource_session,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Datasource.RecycleBin',
    }),
    //回收站
    key: IPageType.Datasource_recycle,
  },
  {
    tab: formatMessage({
      id: 'odc.page.Datasource.CommandLineWindow',
    }),
    //命令行窗口
    key: IPageType.Datasource_obclient,
    isHide() {
      return !setting.enableOBClient;
    },
  },
];
const Index: React.FC<IProps> = function () {
  const params = useParams<{
    id: string;
    page: IPageType;
  }>();
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
      icon={OBSvg}
      tabList={tabs?.filter((tab) => !tab.isHide?.())}
      tabActiveKey={page}
      tabBarExtraContent={
        <ExtraContent
          permissions={connection?.permittedActions as actionTypes[]}
          cid={cid}
          name={connection?.name}
        />
      }
      onTabChange={handleChange}
      bigSelectBottom={
        <Link to={'/datasource'}>
          {
            formatMessage({
              id: 'odc.page.Datasource.ViewAllDataSources',
            }) /*查看所有数据源*/
          }
        </Link>
      }
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
                <Page.component datasource={connection} key={id} id={id} />
              </div>
            );
          }
        })
        .filter(Boolean)}
    </PageContainer>
  );
};
export default Index;
