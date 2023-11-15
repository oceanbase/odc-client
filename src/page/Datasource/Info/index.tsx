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

import { getDataSourceManageDatabase, syncDatasource } from '@/common/network/connection';
import { deleteDatabase } from '@/common/network/database';
import Action from '@/component/Action';
import Reload from '@/component/Button/Reload';
import HelpDoc from '@/component/helpDoc';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { actionTypes } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { IDatasource } from '@/d.ts/datasource';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import { Button, Input, message, Popconfirm, Space, Tooltip } from 'antd';
import { toInteger } from 'lodash';
import React, { useRef, useState } from 'react';
import Icon, { EditOutlined } from '@ant-design/icons';
import ChangeProjectModal from './ChangeProjectModal';
import NewDataBaseButton from './NewDataBaseButton';
interface IProps {
  id: string;
  datasource: IDatasource;
}
const Info: React.FC<IProps> = ({ id, datasource }) => {
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');

  const [visible, setVisible] = useState(false);
  const [database, setDatabase] = useState<IDatabase>(null);

  const lastParams = useRef({
    pageSize: 0,
    current: 0,
  });

  const [data, setData] = useState<IDatabase[]>([]);

  const loadData = async (pageSize, current, name: string = searchValue) => {
    lastParams.current.pageSize = pageSize;
    lastParams.current.current = current;
    const res = await getDataSourceManageDatabase(parseInt(id), name);
    if (res) {
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };

  const { loading: deleteLoading, run: runDeleteDB } = useRequest(deleteDatabase, {
    manual: true,
  });

  const { loading: syncLoading, run: runSync } = useRequest(syncDatasource, {
    manual: true,
  });

  function reload(name: string = searchValue) {
    loadData(lastParams?.current?.pageSize, lastParams?.current?.current, name);
  }

  async function deleteDB(id: number) {
    const isSuccess = await runDeleteDB([id]);
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.Datasource.Info.DeletedSuccessfully' }), //删除成功
      );
      reload();
    }
  }

  async function sync() {
    const isSuccess = await runSync(toInteger(id));
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'odc.Datasource.Info.SynchronizationSucceeded' }), //同步成功
      );
      reload();
    }
  }

  const canCreate = datasource?.permittedActions?.includes(actionTypes.create);
  const canDelete = datasource?.permittedActions?.includes(actionTypes.delete);
  const canUpdate = datasource?.permittedActions?.includes(actionTypes.update);

  return (
    <TableCard
      title={
        canUpdate && (
          <Space>
            <NewDataBaseButton
              mode={datasource?.dialectType}
              onSuccess={() => reload()}
              dataSourceId={id}
              projectId={datasource?.projectId}
              projectName={datasource?.projectName}
            />

            <Button loading={syncLoading} onClick={sync}>
              {formatMessage({ id: 'odc.Datasource.Info.SynchronizeDatabases' }) /*同步数据库*/}
            </Button>
          </Space>
        )
      }
      extra={
        <Space>
          <Input.Search
            onSearch={(v) => {
              setSearchValue(v);
              reload(v);
            }}
            placeholder={formatMessage({ id: 'odc.Datasource.Info.SearchDatabase' })} /*搜索数据库*/
            style={{ width: 200 }}
          />

          <Reload onClick={() => reload()} />
        </Space>
      }
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        columns={[
          {
            title: formatMessage({ id: 'odc.Datasource.Info.DatabaseName' }), //数据库名称
            dataIndex: 'name',
            render: (name, record) => {
              if (!record.existed) {
                return (
                  <HelpDoc
                    leftText
                    isTip={false}
                    title={formatMessage({
                      id: 'odc.Datasource.Info.TheCurrentDatabaseDoesNot',
                    })} /*当前数据库不存在*/
                  >
                    {name}
                  </HelpDoc>
                );
              }
              return name;
            },
          },
          {
            title: formatMessage({ id: 'odc.Datasource.Info.CharacterEncoding' }), //字符编码
            dataIndex: 'charsetName',
            width: 120,
          },
          {
            title: formatMessage({ id: 'odc.Datasource.Info.SortingRules' }), //排序规则
            dataIndex: 'collationName',
            width: 120,
          },
          {
            title: formatMessage({ id: 'odc.Datasource.Info.Project' }), //所属项目
            dataIndex: ['project', 'name'],
            width: 160,
            render(value, record, index) {
              const bindProjectName = record.dataSource?.projectName;
              let tip = null;
              if (bindProjectName) {
                tip = `当前数据源所属项目 ${bindProjectName}，无法修改。可通过编辑数据源修改所属项目`;
              } else if (!canUpdate) {
                tip = '无当前数据源权限';
              }
              return (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div
                    style={{
                      color: value ? null : 'var(--text-color-hint)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value || '未分配项目'}
                  </div>
                  <Tooltip title={tip}>
                    <a
                      style={{
                        flexShrink: 0,
                        flexGrow: 0,
                        color: tip ? 'var(--text-color-hint)' : null,
                      }}
                      onClick={() => {
                        if (tip) {
                          return;
                        }
                        setVisible(true);
                        setDatabase(record);
                      }}
                    >
                      <Icon component={EditOutlined} style={{ fontSize: 14 }} />
                    </a>
                  </Tooltip>
                </div>
              );
            },
          },
          {
            title: formatMessage({ id: 'odc.Datasource.Info.LastSynchronizationTime' }), //最近一次同步时间
            dataIndex: 'lastSyncTime',
            width: 200,
            render(v) {
              return getLocalFormatDateTime(v);
            },
          },
          {
            title: formatMessage({ id: 'odc.Datasource.Info.Operation' }), //操作
            dataIndex: 'name',
            width: 110,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  {canDelete && (
                    <Popconfirm
                      title={formatMessage({
                        id: 'odc.Datasource.Info.AreYouSureYouWant',
                      })} /*确认删除吗？*/
                      disabled={record.existed}
                      onConfirm={() => {
                        return deleteDB(record.id);
                      }}
                    >
                      <Action.Link disabled={record.existed} key={'delete'}>
                        {formatMessage({ id: 'odc.Datasource.Info.Delete' }) /*删除*/}
                      </Action.Link>
                    </Popconfirm>
                  )}
                </Action.Group>
              );
            },
          },
        ]}
        dataSource={data}
        pagination={{
          total,
        }}
        loadData={(page) => {
          const pageSize = page.pageSize;
          const current = page.current;
          loadData(pageSize, current);
        }}
      />

      <ChangeProjectModal
        visible={visible}
        database={database}
        close={() => setVisible(false)}
        onSuccess={() => reload()}
      />
    </TableCard>
  );
};

export default Info;
