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
import { AuditEventResult } from '@/d.ts';
import { Status } from '@/page/Secure/components/RecordPage/component';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/lib/tree';

export const getPageColumns = (params: {
  openDetailModal: (args: { id: number; [key: string]: any }) => void;
  eventfilter: {
    text: string;
    value: string;
  }[];

  eventOptions: DataNode[];
}) => {
  const { eventfilter, eventOptions } = params;
  const columns = [
    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.EventType',
        defaultMessage: '事件类型',
      }),

      //事件类型
      width: 120,
      ellipsis: true,
      key: 'typeName',
      dataIndex: 'typeName',
      filters: eventfilter,
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.EventAction',
        defaultMessage: '事件操作',
      }),

      //事件操作
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
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.column.DataSource',
        defaultMessage: '数据源',
      }), //数据源
      ellipsis: true,
      key: 'connectionName',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={
              formatMessage({
                id: 'odc.component.RecordPopover.column.EnterADataSource',
                defaultMessage: '请输入所属数据源',
              }) //请输入所属数据源
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
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.IpSource',
        defaultMessage: 'IP 来源',
      }),

      //IP来源
      width: 132,
      ellipsis: true,
      key: 'clientIpAddress',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.component.RecordPopover.components.EnterAnIpSource',
              defaultMessage: '请输入 IP 来源',
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
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.ExecutionTime',
        defaultMessage: '执行时间',
      }),

      //执行时间
      width: 190,
      ellipsis: true,
      key: 'startTime',
      dataIndex: 'startTime',
      sorter: true,
      render: (startTime) => getLocalFormatDateTime(startTime),
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.ExecutionResult',
        defaultMessage: '执行结果',
      }),

      //执行结果
      width: 80,
      ellipsis: true,
      key: 'result',
      dataIndex: 'result',
      filters: [
        {
          text: formatMessage({
            id: 'odc.component.RecordPopover.components.Successful',
            defaultMessage: '成功',
          }),

          //成功
          value: AuditEventResult.SUCCESS,
        },

        {
          text: formatMessage({
            id: 'odc.component.RecordPopover.components.Failed',
            defaultMessage: '失败',
          }),

          //失败
          value: AuditEventResult.FAILED,
        },
      ],

      render: (result) => <Status result={result} />,
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.Actions',
        defaultMessage: '操作',
      }),

      //操作
      width: 80,
      key: 'action',
      render: (value, record) => (
        <Action.Link
          onClick={async () => {
            params.openDetailModal(record);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.RecordPopover.components.View',
              defaultMessage: '查看',
            })

            /*查看*/
          }
        </Action.Link>
      ),
    },
  ];

  return !isClient() ? columns : columns.filter((item) => item.dataIndex !== 'connectionName');
};
