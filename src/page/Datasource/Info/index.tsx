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
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import { Button, message, Popconfirm, Space } from 'antd';
import { toInteger } from 'lodash';
import React, { useRef, useState } from 'react';
import ChangeProjectModal from './ChangeProjectModal';
import NewDataBaseButton from './NewDataBaseButton';
interface IProps {
  id: string;
  datasource: IDatasource;
}
const Info: React.FC<IProps> = ({ id, datasource }) => {
  const [total, setTotal] = useState(0);

  const [visible, setVisible] = useState(false);
  const [database, setDatabase] = useState<IDatabase>(null);

  const lastParams = useRef({
    pageSize: 0,
    current: 0,
  });

  const [data, setData] = useState<IDatabase[]>([]);

  const loadData = async (pageSize, current) => {
    lastParams.current.pageSize = pageSize;
    lastParams.current.current = current;
    const res = await getDataSourceManageDatabase(parseInt(id));
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

  function reload() {
    loadData(lastParams?.current?.pageSize, lastParams?.current?.current);
  }

  async function deleteDB(id: number) {
    const isSuccess = await runDeleteDB([id]);
    if (isSuccess) {
      message.success('删除成功');
      reload();
    }
  }

  async function sync() {
    const isSuccess = await runSync(toInteger(id));
    if (isSuccess) {
      message.success('同步成功');
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
              onSuccess={() => reload}
              dataSourceId={id}
            />
            <Button loading={syncLoading} onClick={sync}>
              同步数据库
            </Button>
          </Space>
        )
      }
      extra={<Reload onClick={reload} />}
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        columns={[
          {
            title: '数据库名称',
            dataIndex: 'name',
            render: (name, record) => {
              if (!record.existed) {
                return (
                  <HelpDoc leftText isTip={false} title="当前数据库不存在">
                    {name}
                  </HelpDoc>
                );
              }
              return name;
            },
          },
          {
            title: '字符编码',
            dataIndex: 'charsetName',
            width: 120,
          },
          {
            title: '排序规则',
            dataIndex: 'collationName',
            width: 120,
          },
          {
            title: '所属项目',
            dataIndex: ['project', 'name'],
            width: 160,
          },
          {
            title: '最近一次同步时间',
            dataIndex: 'lastSyncTime',
            width: 200,
            render(v) {
              return getLocalFormatDateTime(v);
            },
          },
          {
            title: '操作',
            dataIndex: 'name',
            width: 110,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  {canUpdate && (
                    <Action.Link
                      disabled={!record.existed}
                      onClick={() => {
                        setVisible(true);
                        setDatabase(record);
                      }}
                      key={'transfer'}
                    >
                      转移项目
                    </Action.Link>
                  )}
                  {canDelete && (
                    <Popconfirm
                      title="确认删除吗？"
                      disabled={record.existed}
                      onConfirm={() => {
                        return deleteDB(record.id);
                      }}
                    >
                      <Action.Link disabled={record.existed} key={'delete'}>
                        删除
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
