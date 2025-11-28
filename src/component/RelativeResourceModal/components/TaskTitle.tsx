import { formatMessage } from '@/util/intl';
import login from '@/store/login';
import { IResourceDependencyItem } from '@/d.ts/relativeResource';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
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
            <div>
              {formatMessage(
                {
                  id: 'src.component.RelativeResourceModal.components.3FC45417',
                  defaultMessage: '姓名：{name} ',
                },
                { name },
              )}{' '}
            </div>
            <div>
              {formatMessage(
                {
                  id: 'src.component.RelativeResourceModal.components.317CEDE8',
                  defaultMessage: '账号：{accountName}',
                },
                { accountName },
              )}
            </div>
            <div>
              {formatMessage(
                {
                  id: 'src.component.RelativeResourceModal.components.FDAA583E',
                  defaultMessage: '角色：{roleNamesText}',
                },
                { roleNamesText },
              )}
            </div>
          </>
        }
      >
        <Typography.Text type="secondary" ellipsis style={{ maxWidth: 120 }}>
          {record?.creator?.accountName || ''}
        </Typography.Text>
      </Tooltip>
      {formatMessage(
        {
          id: 'src.component.RelativeResourceModal.components.AD141E90',
          defaultMessage: ' 创建于 {createTimeText}',
        },
        { createTimeText },
      )}
      {login.isPrivateSpace() ? null : (
        <>
          {` · `}
          <Tooltip
            title={formatMessage(
              {
                id: 'src.component.RelativeResourceModal.components.3BDB332B',
                defaultMessage: '所属项目：{projectName}',
              },
              { projectName },
            )}
          >
            <Typography.Text type="secondary" ellipsis style={{ maxWidth: 180, cursor: 'pointer' }}>
              {projectName}
            </Typography.Text>
          </Tooltip>
        </>
      )}
    </Typography.Text>
  );
};
