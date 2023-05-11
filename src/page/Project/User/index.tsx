import Action from '@/component/Action';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IProject } from '@/d.ts/project';
import { Button } from 'antd';
import React, { useContext } from 'react';
import ProjectContext from '../ProjectContext';
interface IProps {
  id: string;
}
const User: React.FC<IProps> = ({ id }) => {
  const context = useContext(ProjectContext);

  return (
    <TableCard title={<Button type="primary">添加成员</Button>} extra={<Reload />}>
      <MiniTable<IProject['members'][0]>
        rowKey={'id'}
        columns={[
          {
            title: '用户名称',
            dataIndex: 'name',
          },
          {
            title: '账号',
            dataIndex: 'accountName',
            width: 370,
          },
          {
            title: '项目角色',
            dataIndex: 'role',
            width: 370,
          },
          {
            title: '操作',
            dataIndex: 'name',
            width: 135,
            render(_, record) {
              return (
                <Action.Group size={3}>
                  <Action.Link key={'export'}>编辑</Action.Link>
                  <Action.Link key={'import'}>移除</Action.Link>
                </Action.Group>
              );
            },
          },
        ]}
        dataSource={context?.project?.members}
        pagination={{
          total: context?.project?.members?.length,
        }}
        loadData={(page) => {}}
      />
    </TableCard>
  );
};

export default User;
