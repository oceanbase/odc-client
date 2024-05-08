/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Action from '@/component/Action';
import SearchFilter from '@/component/SearchFilter';
import TreeFilter from '@/component/TreeFilter';
import UserPopover from '@/component/UserPopover';
import { AuditEventActionMap, AuditEventMetaMap, IUserMap } from '@/constant/record';
import { AuditEventResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import { DataNode } from 'antd/lib/tree';
import { Status } from './component';

export const getPageColumns = (params: {
  openDetailModal: (args: { id: number; [key: string]: any }) => void;
  reload: () => void;
  startIndex: number;
  eventfilter: {
    text: string;
    value: string;
  }[];

  eventOptions: DataNode[];
  userMap: IUserMap;
}) => {
  const { startIndex, eventfilter, eventOptions, userMap } = params;

  return [
    {
      title: formatMessage({ id: 'odc.components.RecordPage.No' }), //序号
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 62,
      render: (text, record, index) => {
        return startIndex + index + 1;
      },
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.EventType' }), //事件类型
      width: 120,
      ellipsis: true,
      key: 'typeName',
      dataIndex: 'typeName',
      filters: eventfilter,
      render: (type) => AuditEventMetaMap[type],
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.EventAction' }), //事件操作
      width: 160,
      ellipsis: true,
      key: 'actionName',
      filterDropdown: (props) => {
        return <TreeFilter {...props} treeData={eventOptions} />;
      },
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'actionName',
      render: (action) => {
        return AuditEventActionMap[action];
      },
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.column.DataSource' }), //数据源
      ellipsis: true,
      key: 'connectionName',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={
              formatMessage({ id: 'odc.components.RecordPage.column.EnterADataSource' }) //请输入所属数据源
            }
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'connectionName',
      render: (connectionName) => connectionName || '-',
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.IpSource' }), //IP来源
      width: 132,
      ellipsis: true,
      key: 'clientIpAddress',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.RecordPage.EnterAnIpSource',
            })}

            /*请输入IP来源*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'clientIpAddress',
      render: (clientIpAddress) => clientIpAddress || '-',
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.Executor' }), //执行人
      width: 120,
      ellipsis: true,
      key: 'username',
      dataIndex: 'username',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.RecordPage.EnterTheExecutor',
            })}

            /*请输入执行人*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      filters: [],
      render: (username) => {
        const { name, accountName, roleNames = [] } = userMap?.[username] ?? {};
        return (
          <UserPopover name={name ?? '-'} accountName={accountName ?? '-'} roles={roleNames} />
        );
      },
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.ExecutionTime' }), //执行时间
      width: 190,
      ellipsis: true,
      key: 'startTime',
      dataIndex: 'startTime',
      sorter: true,
      render: (startTime) => getLocalFormatDateTime(startTime),
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.ExecutionResult' }), //执行结果
      width: 100,
      ellipsis: true,
      key: 'result',
      dataIndex: 'result',
      filters: [
        {
          text: formatMessage({ id: 'odc.components.RecordPage.Successful' }), //成功
          value: AuditEventResult.SUCCESS,
        },

        {
          text: formatMessage({ id: 'odc.components.RecordPage.Failed' }), //失败
          value: AuditEventResult.FAILED,
        },
      ],

      render: (result) => <Status result={result} />,
    },

    {
      title: formatMessage({ id: 'odc.components.RecordPage.Actions' }), //操作
      width: 60,
      key: 'action',
      render: (value, record) => (
        <Action.Link
          onClick={async () => {
            params.openDetailModal(record);
          }}
        >
          {formatMessage({ id: 'odc.components.RecordPage.View' }) /*查看*/}
        </Action.Link>
      ),
    },
  ];
};
