import { listDatabases } from '@/common/network/database';
import { listEnvironments } from '@/common/network/env';
import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IDatabase } from '@/d.ts/database';
import ChangeProjectModal from '@/page/Datasource/Info/ChangeProjectModal';
import { getLocalFormatDateTime } from '@/util/utils';
import { useRequest } from 'ahooks';
import React, { useRef, useState } from 'react';
import AddDataBaseButton from './AddDataBaseButton';
interface IProps {
  id: string;
}
const Database: React.FC<IProps> = ({ id }) => {
  const [total, setTotal] = useState(0);

  const [data, setData] = useState<IDatabase[]>([]);

  const [visible, setVisible] = useState(false);
  const [database, setDatabase] = useState<IDatabase>(null);

  const params = useRef({
    pageSize: 0,
    current: 0,
  });

  const { data: envList } = useRequest(listEnvironments);

  const loadData = async (pageSize, current) => {
    params.current.pageSize = pageSize;
    params.current.current = current;
    const res = await listDatabases(parseInt(id), null, current, pageSize);
    if (res) {
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };

  function reload() {
    loadData(params.current.pageSize, params.current.current);
  }

  return (
    <TableCard
      title={<AddDataBaseButton onSuccess={() => reload()} projectId={parseInt(id)} />}
      extra={
        <FilterIcon onClick={reload}>
          <Reload />
        </FilterIcon>
      }
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
            title: '所属数据源',
            dataIndex: ['dataSource', 'name'],
            width: 160,
          },
          {
            title: '环境',
            dataIndex: 'organizationId',
            width: 100,
            render(value, record, index) {
              return envList?.find((env) => env.id == value)?.name || '-';
            },
          },
          {
            title: '上一次同步时间',
            dataIndex: 'lastSyncTime',
            width: 170,
            render(v) {
              return getLocalFormatDateTime(v);
            },
          },
          {
            title: '操作',
            dataIndex: 'name',
            width: 200,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  <Action.Link key={'export'}>导出</Action.Link>
                  <Action.Link key={'import'}>导入</Action.Link>
                  <Action.Link key={'ddl'}>数据库变更</Action.Link>
                  <Action.Link key={'login'}>登录数据库</Action.Link>
                  <Action.Link
                    key={'transfer'}
                    onClick={() => {
                      setVisible(true);
                      setDatabase(record);
                    }}
                  >
                    转移项目
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

export default Database;
