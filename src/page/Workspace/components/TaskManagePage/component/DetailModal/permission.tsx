import { SimpleTextItem } from '@/component/AsyncTaskModal/components';
import ConnectionPopover from '@/component/ConnectionPopover';
import DisplayTable from '@/component/DisplayTable';
import type { IPermissionTaskParams, ITaskResult, TaskDetail } from '@/d.ts';
import { IConnectionType, TaskStatus } from '@/d.ts';
import connectionStore from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { getSourceAuthLabelString } from '@/util/manage';
import { getFormatDateTime } from '@/util/utils';
import { Divider, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from '../../index.less';

const getConnectionColumns = () => {
  return [
    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.component.DetailModal.permission.ConnectionName',
      }), //连接名称
      ellipsis: true,
      render: (name, record) => {
        return (
          <Popover
            overlayClassName={styles.connectionPopover}
            placement="right"
            content={<ConnectionPopover connection={record} />}
          >
            <div>{name}</div>
          </Popover>
        );
      },
    },

    {
      dataIndex: 'actions',
      title: formatMessage({
        id: 'odc.component.DetailModal.permission.PermissionType',
      }), //申请权限类型
      ellipsis: true,
      width: 255,
      render: (actions) => getSourceAuthLabelString(actions),
    },

    {
      dataIndex: 'enabled',
      title: formatMessage({
        id: 'odc.component.DetailModal.permission.Status',
      }), //状态
      ellipsis: true,
      width: 108,
      render: (enabled) => (
        <span>
          {
            enabled
              ? formatMessage({
                  id: 'odc.component.DetailModal.permission.Enable',
                }) //启用
              : formatMessage({
                  id: 'odc.component.DetailModal.permission.Disable',
                }) //停用
          }
        </span>
      ),
    },
  ];
};

interface IProps {
  status: TaskStatus;
  ids: number[];
  actions: string[];
}

export const ConnectionTable: React.FC<IProps> = (props) => {
  const { status, ids, actions } = props;
  const [connections, setConnections] = useState([]);
  const showUsername = ![
    TaskStatus.APPROVING,
    TaskStatus.REJECTED,
    TaskStatus.APPROVAL_EXPIRED,
  ].includes(status);

  const loadData = async () => {
    const res = await connectionStore.getList({
      visibleScope: IConnectionType.ORGANIZATION,
      minPrivilege: 'apply',
      id: [...ids],
    });

    const data = res?.contents?.map(({ username, ...rest }) => {
      return {
        ...rest,
        username: showUsername ? username : null,
        actions,
      };
    });
    setConnections(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DisplayTable
      rowKey="id"
      columns={getConnectionColumns()}
      dataSource={connections}
      disablePagination
      scroll={null}
    />
  );
};

export const getItems = (
  _task: TaskDetail<IPermissionTaskParams>,
  result: ITaskResult,
  hasFlow: boolean,
) => {
  if (!_task) {
    return [];
  }
  const res: {
    sectionName?: string;
    textItems: [string, string | number, number?][];
    sectionRender?: (task: TaskDetail<IPermissionTaskParams>) => void;
  }[] = [
    {
      textItems: [],
      sectionRender: (task: TaskDetail<IPermissionTaskParams>) => {
        const maxRiskLevel = task?.maxRiskLevel;
        return (
          <>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.TaskNumber',
              })}
              /*任务编号*/ content={task?.id}
            />
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.TaskType',
              })}
              /*任务类型*/ content={formatMessage({
                id: 'odc.component.DetailModal.permission.PermissionApplication',
              })} /*权限申请*/
            />
            {hasFlow && (
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.DetailModal.permission.RiskLevel',
                })}
                /*风险等级*/ content={
                  formatMessage(
                    {
                      id: 'odc.component.DetailModal.permission.MaxrisklevelLevel',
                    },
                    { maxRiskLevel: maxRiskLevel },
                  ) //`${maxRiskLevel}级`
                }
              />
            )}
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.ApplyForAPublicConnection',
              })}
              /*申请公共连接*/ direction="column"
              content={
                <ConnectionTable
                  status={_task.status}
                  ids={_task.parameters?.applyInfoList?.map((item) => item.resourceId)}
                  actions={_task.parameters?.applyInfoList?.[0].actions}
                />
              }
            />

            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.ReasonForApplication',
              })}
              /*申请原因*/ content={task.description}
            />
            <Divider style={{ marginTop: 4 }} />
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.Founder',
              })}
              /*创建人*/ content={task?.creator?.name || '-'}
            />
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DetailModal.permission.CreationTime',
              })}
              /*创建时间*/ content={getFormatDateTime(task.createTime)}
            />
          </>
        );
      },
    },
  ].filter(Boolean);
  return res;
};
