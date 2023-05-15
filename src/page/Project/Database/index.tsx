import { listDatabases } from '@/common/network/database';
import Action from '@/component/Action';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IDatabase } from '@/d.ts/database';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button } from 'antd';
import React, { useState } from 'react';
interface IProps {
  id: string;
}
const Database: React.FC<IProps> = ({ id }) => {
  const [total, setTotal] = useState(0);

  const [data, setData] = useState<IDatabase[]>([]);

  const loadData = async (pageSize, current) => {
    const res = await listDatabases(parseInt(id), null, current, pageSize);
    if (res) {
      setData(res?.contents);
      setTotal(res?.page?.totalElements);
    }
  };

  return (
    <TableCard title={<Button type="primary">添加数据库</Button>} extra={<Reload />}>
      <MiniTable<IDatabase>
        rowKey={'id'}
        columns={[
          {
            title: '数据库名称',
            dataIndex: 'name',
            render: (name) => {
              return <a>name</a>;
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
            width: 220,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  <Action.Link key={'export'}>导出</Action.Link>
                  <Action.Link key={'import'}>导入</Action.Link>
                  <Action.Link key={'ddl'}>数据库变更</Action.Link>
                  <Action.Link key={'login'}>登录数据库</Action.Link>
                  <Action.Link key={'transfer'}>转移项目</Action.Link>
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
    </TableCard>
  );
};

export default Database;
