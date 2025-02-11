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

import SearchFilter from '@/component/SearchFilter';
import {
  EChannelType,
  EMessageStatus,
  IChannel,
  IMessage,
  IPolicy,
  IPolicyColumnsKeys,
  IChannelColumnsKeys,
} from '@/d.ts/projectNotification';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { SearchOutlined } from '@ant-design/icons';
import { Space, Switch } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { EChannelTypeMap, EMessageStatusMap, EPolicyFormMode, TPolicyForm } from './interface';
import { MessageStatus } from './MessageStatus';

// #region ------------------------- notification message -------------------------
type GetMessageColumns = ({
  channelFilter,
  handleOpenMessageDetailDrawer,
}: {
  channelFilter: { text: string; value: number }[];
  handleOpenMessageDetailDrawer: (messageId: number) => void;
}) => ColumnType<IMessage>[];
export const getMessageColumns: GetMessageColumns = function ({
  channelFilter,
  handleOpenMessageDetailDrawer,
}) {
  return [
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.3380A1F2',
        defaultMessage: '工单事件',
      }), //'工单事件'
      dataIndex: 'title',
      key: 'title',
      width: 260,
      filters: [],
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={null}
            placeholder={
              formatMessage({
                id: 'src.page.Project.Notification.components.0F9F4DF9',
                defaultMessage: '通道名称',
              }) /*"通道名称"*/
            }
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.BED6CE2B',
        defaultMessage: '消息通道',
      }), //'消息通道'
      dataIndex: 'channel',
      key: 'channel',
      width: 207,
      filters: channelFilter,
      render: (channel) => channel?.name || '-',
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.94C9B938',
        defaultMessage: '生效时间',
      }), //'生效时间'
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => a?.createTime - b?.createTime,
      sortDirections: ['ascend', 'descend'],
      render: (createTime) => (createTime ? getLocalFormatDateTime(createTime) : '-'),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.3F4AA52D',
        defaultMessage: '最后推送时间',
      }), //'最后推送时间'
      dataIndex: 'lastSentTime',
      key: 'lastSentTime',
      sorter: (a, b) => a?.lastSentTime - b?.lastSentTime,
      sortDirections: ['ascend', 'descend'],
      render: (lastSentTime) => (lastSentTime ? getLocalFormatDateTime(lastSentTime) : '-'),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.C17F635B',
        defaultMessage: '推送状态',
      }), //'推送状态'
      dataIndex: 'status',
      width: 158,
      key: 'status',
      filters: [
        {
          text: EMessageStatusMap[EMessageStatus.CREATED],
          value: EMessageStatus.CREATED,
        },
        {
          text: EMessageStatusMap[EMessageStatus.SENDING],
          value: EMessageStatus.SENDING,
        },
        {
          text: EMessageStatusMap[EMessageStatus.SENT_SUCCESSFULLY],
          value: EMessageStatus.SENT_SUCCESSFULLY,
        },
        {
          text: EMessageStatusMap[EMessageStatus.SENT_FAILED],
          value: EMessageStatus.SENT_FAILED,
        },
        {
          text: EMessageStatusMap[EMessageStatus.THROWN],
          value: EMessageStatus.THROWN,
        },
      ],

      render: (status, message) => {
        return <MessageStatus message={message} />;
      },
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.550A0B74',
        defaultMessage: '操作',
      }), //'操作'
      width: 104,
      key: 'action',
      render: (_, message) => {
        return (
          <a onClick={() => handleOpenMessageDetailDrawer(message?.id)}>
            {
              formatMessage({
                id: 'src.page.Project.Notification.components.445FB17E' /*查看*/,
                defaultMessage: '查看',
              }) /* 查看 */
            }
          </a>
        );
      },
    },
  ];
};
// #endregion

// #region ------------------------- notification policy -------------------------
type GetPolicyColumns = ({
  projectId,
  handleUpdatePolicies,
  handleSwitchPoliciesStatus,
  hanleOpenChannelDetailDrawer,
  hideColumns,
}: {
  projectId: number;
  handleUpdatePolicies: (formType: TPolicyForm) => void;
  handleSwitchPoliciesStatus: (formType: TPolicyForm, enabled?: boolean) => Promise<void>;
  hanleOpenChannelDetailDrawer;
  hideColumns?: IPolicyColumnsKeys[];
}) => ColumnType<IPolicy>[];
export const getPolicyColumns: GetPolicyColumns = function ({
  projectId,
  handleUpdatePolicies,
  handleSwitchPoliciesStatus,
  hanleOpenChannelDetailDrawer,
  hideColumns = [],
}) {
  const columns = [
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.3F3F37F5',
        defaultMessage: '事件',
      }), //'事件'
      dataIndex: 'eventName',
      filters: [],
      width: 354,
      key: 'eventName',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={null}
            placeholder={
              formatMessage({
                id: 'src.page.Project.Notification.components.6C61DE34',
                defaultMessage: '事件',
              }) /*"事件"*/
            }
          />
        );
      },

      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.C21BB343',
        defaultMessage: '启用状态',
      }), //'启用状态'
      dataIndex: 'enabled',
      width: 122,
      key: 'enabled',
      render: (status, policy) => (
        <Switch
          checked={status}
          size="small"
          onClick={() =>
            handleSwitchPoliciesStatus({
              mode: EPolicyFormMode.SINGLE,
              policies: [policy],
            })
          }
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.A7341EE0',
        defaultMessage: '推送通道',
      }), //'推送通道'
      dataIndex: 'channels',
      width: 480,
      key: 'channels',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={null}
            placeholder={
              formatMessage({
                id: 'src.page.Project.Notification.components.5002EFB0',
                defaultMessage: '推送通道',
              }) /*"推送通道"*/
            }
          />
        );
      },

      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),

      render: (channels: IChannel<EChannelType>[] = []) => {
        if (channels?.length === 0) {
          return '-';
        }
        const channelNames = channels
          ?.map((channel) => {
            if (channel?.name && channel?.id) {
              return {
                name: channel?.name,
                id: channel?.id,
              };
            }
            return null;
          })
          ?.filter(Boolean);
        if (channelNames?.length) {
          return channelNames?.map((channel, index) => {
            if (index < channelNames?.length - 1) {
              return (
                <>
                  <a key={index} onClick={() => hanleOpenChannelDetailDrawer(channel)}>
                    {channel?.name}
                  </a>
                  、
                </>
              );
            }
            return (
              <a key={index} onClick={() => hanleOpenChannelDetailDrawer(channel)}>
                {channel?.name}
              </a>
            );
          });
        }
        return '-';
      },
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.30DE4191',
        defaultMessage: '操作',
      }), //'操作'
      key: 'action',
      width: 140,
      render: (_, proxy) => {
        return (
          <a
            onClick={() =>
              handleUpdatePolicies({
                mode: EPolicyFormMode.SINGLE,
                policies: [proxy],
              })
            }
          >
            {
              formatMessage({
                id: 'src.page.Project.Notification.components.7555452E' /*添加通道*/,
                defaultMessage: '添加通道',
              }) /* 添加通道 */
            }
          </a>
        );
      },
    },
  ];
  return columns.filter((item) => !hideColumns.includes(item.key as IPolicyColumnsKeys));
};
// #endregion

// #region ------------------------- notification channel -------------------------
type GetChannelColumn = ({
  handleDelete,
  handleChannelEdit,
  hanleOpenChannelDetailDrawer,
  hideColumns,
}: {
  handleDelete: (channelId: number) => void;
  handleChannelEdit: (channelId: number) => void;
  hanleOpenChannelDetailDrawer: (channel: Omit<IChannel<EChannelType>, 'channelConfig'>) => void;
  hideColumns?: IChannelColumnsKeys[];
}) => ColumnType<IChannel<EChannelType>>[];
export const getChannelColumns: GetChannelColumn = function ({
  handleDelete,
  handleChannelEdit,
  hanleOpenChannelDetailDrawer,
  hideColumns = [],
}) {
  const columns: ColumnType<IChannel<EChannelType>>[] = [
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.76BA6F01',
        defaultMessage: '通道名称',
      }), //'通道名称'
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            selectedKeys={null}
            placeholder={
              formatMessage({
                id: 'src.page.Project.Notification.components.5CDC10CB',
                defaultMessage: '通道名称',
              }) /*"通道名称"*/
            }
          />
        );
      },

      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.2E263203',
        defaultMessage: '通道类型',
      }), //'通道类型'
      dataIndex: 'type',
      key: 'type',
      filters: [
        {
          text: EChannelTypeMap[EChannelType.DING_TALK],
          value: EChannelType.DING_TALK,
        },
        {
          text: EChannelTypeMap[EChannelType.FEI_SHU],
          value: EChannelType.FEI_SHU,
        },
        {
          text: EChannelTypeMap[EChannelType.WE_COM],
          value: EChannelType.WE_COM,
        },
        {
          text: EChannelTypeMap[EChannelType.WEBHOOK],
          value: EChannelType.WEBHOOK,
        },
      ],

      render: (type) => EChannelTypeMap[type as EChannelType],
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.9E340A54',
        defaultMessage: '创建人',
      }), //'创建人'
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.F8D12615',
        defaultMessage: '创建时间',
      }), //'创建时间'
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => a?.createTime - b?.createTime,
      sortDirections: ['ascend', 'descend'],
      render: (createTime) => (createTime ? getLocalFormatDateTime(createTime) : '-'),
    },
    {
      title: formatMessage({
        id: 'src.page.Project.Notification.components.89B6BD2A',
        defaultMessage: '操作',
      }), //'操作'
      key: 'action',
      render: (channel: IChannel<EChannelType>) => {
        return (
          <Space>
            <a onClick={() => hanleOpenChannelDetailDrawer(channel)}>
              {
                formatMessage({
                  id: 'src.page.Project.Notification.components.2D408702' /*查看*/,
                  defaultMessage: '查看',
                }) /* 查看 */
              }
            </a>
            <a onClick={() => handleChannelEdit(channel?.id)}>
              {
                formatMessage({
                  id: 'src.page.Project.Notification.components.1C77B416' /*编辑*/,
                  defaultMessage: '编辑',
                }) /* 编辑 */
              }
            </a>
            <a onClick={() => handleDelete(channel?.id)}>
              {
                formatMessage({
                  id: 'src.page.Project.Notification.components.B65E55FA' /*删除*/,
                  defaultMessage: '删除',
                }) /* 删除 */
              }
            </a>
          </Space>
        );
      },
    },
  ];
  return columns.filter((item) => !hideColumns.includes(item.key as IChannelColumnsKeys));
};
// #endregion
