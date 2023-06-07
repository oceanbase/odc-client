import { listDatabases } from '@/common/network/database';
import Action from '@/component/Action';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IDatabase } from '@/d.ts/database';
import { getLocalFormatDateTime } from '@/util/utils';
import React, { useRef, useState } from 'react';
import ChangeProjectModal from './ChangeProjectModal';
import NewDataBaseButton from './NewDataBaseButton';
interface IProps {
  id: string;
}
const Info: React.FC<IProps> = ({ id }) => {
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
    const res = await listDatabases(null, parseInt(id), current, pageSize);
    if (res) {
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };

  function reload() {
    loadData(lastParams?.current?.pageSize, lastParams?.current?.current);
  }

  return (
    <TableCard
      title={<NewDataBaseButton onSuccess={() => reload} dataSourceId={id} />}
      extra={<Reload onClick={reload} />}
    >
      <MiniTable<IDatabase>
        rowKey={'id'}
        columns={[
          {
            title: '数据库名称',
            dataIndex: 'name',
            render: (name) => {
              return <a>{name}</a>;
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
            width: 140,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  <Action.Link key={'login'}>登录</Action.Link>
                  <Action.Link key={'sync'}>同步</Action.Link>
                  <Action.Link
                    onClick={() => {
                      setVisible(true);
                      setDatabase(record);
                    }}
                    key={'transfer'}
                  >
                    转移
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
