import Action from '@/component/Action';
import FilterIcon from '@/component/Button/FIlterIcon';
import Reload from '@/component/Button/Reload';
import MiniTable from '@/component/Table/MiniTable';
import TableCard from '@/component/Table/TableCard';
import { IProject, ProjectRole } from '@/d.ts/project';
import { Button } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import ProjectContext from '../ProjectContext';
import AddUserModal from './AddUserModal';
interface IProps {
  id: string;
}
const User: React.FC<IProps> = ({ id }) => {
  const context = useContext(ProjectContext);

  const [addUserModalVisiable, setAddUserModalVisiable] = useState(false);

  const dataSource: (IProject['members'][0] & { roles: ProjectRole[] })[] = useMemo(() => {
    const userMap = new Map<number, IProject['members'][0] & { roles: ProjectRole[] }>();
    context?.project?.members?.forEach((mem) => {
      const { id, role } = mem;
      if (userMap.has(id)) {
        userMap.get(id).roles.push(role);
      } else {
        userMap.set(id, {
          ...mem,
          roles: [role],
        });
      }
    });
    return [...userMap.values()];
  }, [context?.project?.members]);

  return (
    <TableCard
      title={
        <Button type="primary" onClick={() => setAddUserModalVisiable(true)}>
          添加成员
        </Button>
      }
      extra={
        <FilterIcon onClick={context.reloadProject}>
          <Reload />
        </FilterIcon>
      }
    >
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
            dataIndex: 'roles',
            width: 370,
            render(v) {
              return v?.join(' | ');
            },
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
        dataSource={dataSource}
        pagination={{
          total: dataSource?.length,
        }}
        loadData={(page) => {}}
      />
      <AddUserModal
        visible={addUserModalVisiable}
        close={() => setAddUserModalVisiable(false)}
        onSuccess={() => {
          context.reloadProject();
        }}
        project={context.project}
      />
    </TableCard>
  );
};

export default User;
