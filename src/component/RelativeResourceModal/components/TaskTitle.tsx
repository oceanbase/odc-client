import login from '@/store/login';
import { IResourceDependencyItem } from '@/d.ts/relativeResource';
import { getLocalFormatDateTime } from '@/util/utils';
import { Tooltip, Typography } from 'antd';

export const TaskTitle = ({ record }: { record: IResourceDependencyItem }) => {
  const { creator, createTime, project } = record || {};
  const { name, accountName, roleNames } = creator || {
    name: '-',
    accountName: '-',
    roleNames: [],
  };
  const roleNamesText = roleNames?.join('/') || '-';
  const projectName = project?.name || '-';
  const createTimeText = getLocalFormatDateTime(createTime) || '-';
  return (
    <Typography.Text type="secondary">
      {`#${record.id || '-'} · `}
      <Tooltip
        title={
          <>
            <div>{`姓名：${name} `} </div>
            <div>{`账号：${accountName}`}</div>
            <div>{`角色：${roleNamesText}`}</div>
          </>
        }
      >
        <Typography.Text type="secondary" ellipsis style={{ maxWidth: 120 }}>
          {record?.creator?.accountName || ''}
        </Typography.Text>
      </Tooltip>
      {` 创建于 ${createTimeText}`}
      {login.isPrivateSpace() ? null : (
        <>
          {` · `}
          <Tooltip title={`所属项目：${projectName}`}>
            <Typography.Text type="secondary" ellipsis style={{ maxWidth: 180, cursor: 'pointer' }}>
              {projectName}
            </Typography.Text>
          </Tooltip>
        </>
      )}
    </Typography.Text>
  );
};
