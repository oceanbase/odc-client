import { listDatabases } from '@/common/network/database';
import { listEnvironments } from '@/common/network/env';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import HelpDoc from '@/component/helpDoc';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import { TaskPageType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import modalStore from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { gotoSQLWorkspace } from '@/util/route';
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import { Input, Space, Tag } from 'antd';
import { toInteger } from 'lodash';
import React, { useRef, useState } from 'react';
import AddDataBaseButton from './AddDataBaseButton';
interface IProps {
  id: string;
}
const Database: React.FC<IProps> = ({ id }) => {
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');

  const [data, setData] = useState<IDatabase[]>([]);

  const [visible, setVisible] = useState(false);
  const [database, setDatabase] = useState<IDatabase>(null);

  const params = useRef({
    pageSize: 0,
    current: 0,
    environmentId: null,
  });

  const { data: envList } = useRequest(listEnvironments);

  const loadData = async (pageSize, current, environmentId, name: string = searchValue) => {
    params.current.pageSize = pageSize;
    params.current.current = current;
    params.current.environmentId = environmentId;
    const res = await listDatabases(parseInt(id), null, current, pageSize, name, environmentId);
    if (res) {
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };

  function reload(name: string = searchValue) {
    loadData(params.current.pageSize, params.current.current, params.current.environmentId, name);
  }

  const handleMenuClick = (type: TaskPageType, databaseId: number) => {
    switch (type) {
      case TaskPageType.IMPORT:
        modalStore.changeImportModal(true, {
          databaseId,
        });
        break;
      case TaskPageType.EXPORT:
        modalStore.changeExportModal(true, {
          databaseId,
        });
        break;
      case TaskPageType.ASYNC:
        modalStore.changeCreateAsyncTaskModal(true, {
          databaseId,
        });
        break;
      default:
    }
  };

  return (
    <TableCard
      title={<AddDataBaseButton onSuccess={() => reload()} projectId={parseInt(id)} />}
      extra={
        <Space>
          <Input.Search
            onSearch={(v) => {
              setSearchValue(v);
              reload(v);
            }}
            placeholder={formatMessage({
              id: 'odc.Project.Database.SearchDatabase',
            })} /*搜索数据库*/
            style={{ width: 200 }}
          />

          <FilterIcon onClick={() => reload()}>
            <Reload />
          </FilterIcon>
        </Space>
      }
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        columns={[
          {
            title: formatMessage({ id: 'odc.Project.Database.DatabaseName' }), //数据库名称
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
              return <a onClick={() => gotoSQLWorkspace(toInteger(id), null, record.id)}>{name}</a>;
            },
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.CharacterEncoding' }), //字符编码
            dataIndex: 'charsetName',
            width: 120,
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.SortingRules' }), //排序规则
            dataIndex: 'collationName',
            width: 120,
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.DataSource' }), //所属数据源
            dataIndex: ['dataSource', 'name'],
            width: 160,
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.Environment' }), //环境
            dataIndex: 'environmentId',
            filters: envList?.map((env) => {
              return {
                text: env.name,
                value: env.id,
              };
            }),
            filterMultiple: false,
            width: 100,
            render(value, record, index) {
              return (
                <Tag color={record?.environment?.style?.toLowerCase()}>
                  {record?.environment?.name}
                </Tag>
              );
            },
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.LastSynchronizationTime' }), //上一次同步时间
            dataIndex: 'lastSyncTime',
            width: 170,
            render(v) {
              return getLocalFormatDateTime(v);
            },
          },
          {
            title: formatMessage({ id: 'odc.Project.Database.Operation' }), //操作
            dataIndex: 'name',
            width: 200,
            render(_, record) {
              if (!record.existed) {
                return '-';
              }
              return (
                <Action.Group size={3}>
                  <Action.Link
                    key={'export'}
                    onClick={() => {
                      handleMenuClick(TaskPageType.EXPORT, record.id);
                    }}
                  >
                    {formatMessage({ id: 'odc.Project.Database.Export' }) /*导出*/}
                  </Action.Link>
                  <Action.Link
                    key={'import'}
                    onClick={() => {
                      handleMenuClick(TaskPageType.IMPORT, record.id);
                    }}
                  >
                    {formatMessage({ id: 'odc.Project.Database.Import' }) /*导入*/}
                  </Action.Link>
                  <Action.Link
                    key={'ddl'}
                    onClick={() => {
                      handleMenuClick(TaskPageType.ASYNC, record.id);
                    }}
                  >
                    {formatMessage({ id: 'odc.Project.Database.DatabaseChanges' }) /*数据库变更*/}
                  </Action.Link>
                  <Action.Link
                    key={'login'}
                    onClick={() => {
                      gotoSQLWorkspace(parseInt(id), record?.dataSource?.id, record?.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.Project.Database.LogOnToTheDatabase',
                      }) /*登录数据库*/
                    }
                  </Action.Link>
                  <Action.Link
                    key={'transfer'}
                    onClick={() => {
                      setVisible(true);
                      setDatabase(record);
                    }}
                  >
                    {formatMessage({ id: 'odc.Project.Database.TransferProject' }) /*转移项目*/}
                  </Action.Link>
                </Action.Group>
              );
            },
          },
        ]}
        dataSource={data}
        pagination={{
          total,
        }}
        loadData={(page, filters) => {
          const pageSize = page.pageSize;
          const current = page.current;
          loadData(pageSize, current, filters['environmentId']?.[0]);
        }}
      />

      <ChangeProjectModal
        visible={visible}
        database={database}
        close={() => setVisible(false)}
        onSuccess={() => reload()}
      />

      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal />
    </TableCard>
  );
};

export default Database;
