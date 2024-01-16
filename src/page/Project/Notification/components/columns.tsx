import { Space, Switch } from 'antd';
import {
  EChannelType,
  EMessageStatus,
  IChannel,
  IMessage,
  IPolicy,
} from '@/d.ts/projectNotification';
import { ColumnType } from 'antd/lib/table';
import { TPolicyForm, EPolicyFormMode, EChannelTypeMap, EMessageStatusMap } from './interface';
import SearchFilter from '@/component/SearchFilter';
import { SearchOutlined } from '@ant-design/icons';
import { getLocalFormatDateTime } from '@/util/utils';
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
      title: '工单事件',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      filters: [],
      filterDropdown: (props) => {
        return <SearchFilter {...props} selectedKeys={null} placeholder="通道名称" />;
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
      title: '消息通道',
      dataIndex: 'channel',
      key: 'channel',
      width: 207,
      filters: channelFilter,
      render: (channel) => channel?.name || '-',
    },
    {
      title: '生效时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => a?.createTime - b?.createTime,
      sortDirections: ['ascend', 'descend'],
      render: (createTime) => (createTime ? getLocalFormatDateTime(createTime) : '-'),
    },
    {
      title: '最后推送时间',
      dataIndex: 'lastSentTime',
      key: 'lastSentTime',
      sorter: (a, b) => a?.lastSentTime - b?.lastSentTime,
      sortDirections: ['ascend', 'descend'],
      render: (lastSentTime) => (lastSentTime ? getLocalFormatDateTime(lastSentTime) : '-'),
    },
    {
      title: '推送状态',
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
      title: '操作',
      width: 104,
      key: 'action',
      render: (_, message) => {
        return <a onClick={() => handleOpenMessageDetailDrawer(message?.id)}>查看</a>;
      },
    },
  ];
};
// #endregion

// #region ------------------------- notification policy -------------------------
type GetPolicyColumns = ({
  projectId,
  handleUpdatePolicies,
  handleSwitchPolicyStatus,
  hanleOpenChannelDetailDrawer,
}: {
  projectId: number;
  handleUpdatePolicies: (formType: TPolicyForm) => void;
  handleSwitchPolicyStatus: (policy: IPolicy) => void;
  hanleOpenChannelDetailDrawer;
}) => ColumnType<IPolicy>[];
export const getPolicyColumns: GetPolicyColumns = function ({
  projectId,
  handleUpdatePolicies,
  handleSwitchPolicyStatus,
  hanleOpenChannelDetailDrawer,
}) {
  return [
    {
      title: '事件',
      dataIndex: 'eventName',
      filters: [],
      width: 354,
      key: 'eventName',
      filterDropdown: (props) => {
        return <SearchFilter {...props} selectedKeys={null} placeholder="事件" />;
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
      title: '启用状态',
      dataIndex: 'enabled',
      width: 122,
      key: 'enabled',
      render: (status, policy) => (
        <Switch checked={status} size="small" onClick={() => handleSwitchPolicyStatus(policy)} />
      ),
    },
    {
      title: '推送通道',
      dataIndex: 'channels',
      width: 480,
      key: 'channels',
      filterDropdown: (props) => {
        return <SearchFilter {...props} selectedKeys={null} placeholder="推送通道" />;
      },

      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? 'var(--icon-color-focus)' : undefined,
          }}
        />
      ),
      render: (channels: IChannel[] = []) => {
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
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, proxy) => {
        return (
          <a
            onClick={() =>
              handleUpdatePolicies({
                mode: EPolicyFormMode.SINGLE,
                projectId: projectId,
                policies: [proxy],
              })
            }
          >
            添加通道
          </a>
        );
      },
    },
  ];
};
// #endregion

// #region ------------------------- notification channel -------------------------
type GetChannelColumn = ({
  handleDelete,
  handleChannelEdit,
  hanleOpenChannelDetailDrawer,
}: {
  handleDelete: (channelId: number) => void;
  handleChannelEdit: (channelId: number) => void;
  hanleOpenChannelDetailDrawer: (channel: Omit<IChannel, 'channelConfig'>) => void;
}) => ColumnType<IChannel>[];
export const getChannelColumns: GetChannelColumn = function ({
  handleDelete,
  handleChannelEdit,
  hanleOpenChannelDetailDrawer,
}) {
  return [
    {
      title: '通道名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (props) => {
        return <SearchFilter {...props} selectedKeys={null} placeholder="通道名称" />;
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
      title: '通道类型',
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
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => a?.createTime - b?.createTime,
      sortDirections: ['ascend', 'descend'],
      render: (createTime) => (createTime ? getLocalFormatDateTime(createTime) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (channel: IChannel) => {
        return (
          <Space>
            <a onClick={() => hanleOpenChannelDetailDrawer(channel)}>查看</a>
            <a onClick={() => handleChannelEdit(channel?.id)}>编辑</a>
            <a onClick={() => handleDelete(channel?.id)}>删除</a>
          </Space>
        );
      },
    },
  ];
};
// #endregion
