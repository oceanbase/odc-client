import {
  detailMessage,
  getChannelsList,
  getMessagesList,
} from '@/common/network/projectNotification';
import CommonTable from '@/component/CommonTable';
import { Descriptions, Drawer } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { IResponseData } from '@/d.ts';
import { EMessageStatus, IMessage } from '@/d.ts/projectNotification';
import { getMessageColumns } from './columns';
import styles from './index.less';
import { getLocalFormatDateTime } from '@/util/utils';
import { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { EMessageStatusMap } from './interface';
import { useLoop } from '@/util/hooks/useLoop';

const Message: React.FC<{
  projectId: number;
}> = ({ projectId }) => {
  const tableRef = useRef<ITableInstance>();
  const [formDrawerOpen, setFormDrawerOpen] = useState<boolean>(false);
  const [messagesList, setMessagesList] = useState<IResponseData<IMessage>>();
  const [selectedMessageId, setSelectedMessageId] = useState<number>(null);
  const [channelFilter, setChannelFilter] = useState<{ text: string; value: number }[]>([]);

  const { loop: loadMessages, destory } = useLoop((count) => {
    return async (args: ITableLoadOptions) => {
      const { filters, sorter, pagination, pageSize } = args ?? {};
      const { title, channel, status } = filters ?? {};
      const { column, order } = sorter ?? {};
      const { current = 1 } = pagination ?? {};
      const data = {
        title,
        channelId: channel,
        status,
        sort: column?.dataIndex,
        page: current,
        size: pageSize,
      };
      data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
      const messages = await getMessagesList(projectId, data);
      if (messages) {
        setMessagesList(messages as IResponseData<IMessage>);
      }
    };
  }, 6000);
  const handleOpenMessageDetailDrawer = (messageId: number) => {
    setSelectedMessageId(messageId);
    setFormDrawerOpen(true);
  };
  const handleCloseMessageDetailDrawer = () => {
    setFormDrawerOpen(false);
    setSelectedMessageId(null);
  };
  async function loadChannleFilter() {
    const channels = await getChannelsList(projectId);
    const newOptions = channels?.contents?.map((channel) => ({
      text: channel?.name,
      value: channel?.id,
    }));
    setChannelFilter(newOptions);
  }
  useEffect(() => {
    loadChannleFilter();
    return () => {
      destory();
    };
  }, []);
  const columns = getMessageColumns({
    channelFilter,
    handleOpenMessageDetailDrawer,
  });
  return (
    <div className={styles.common}>
      <DetailDrawer
        formDrawerOpen={formDrawerOpen}
        projectId={projectId}
        messageId={selectedMessageId}
        handleCloseMessageDetailDrawer={handleCloseMessageDetailDrawer}
      />
      <CommonTable
        ref={tableRef}
        key="MessageCommonTable"
        titleContent={null}
        showToolbar={false}
        onLoad={loadMessages}
        onChange={loadMessages}
        operationContent={null}
        tableProps={{
          columns,
          dataSource: messagesList?.contents,
          pagination: {
            current: messagesList?.page?.number,
            total: messagesList?.page?.totalElements,
          },
        }}
      />
    </div>
  );
};
const DetailDrawer: React.FC<{
  projectId: number;
  messageId: number;
  formDrawerOpen: boolean;
  handleCloseMessageDetailDrawer: () => void;
}> = ({ projectId, messageId, formDrawerOpen, handleCloseMessageDetailDrawer }) => {
  const [message, setMessage] = useState<IMessage>();
  async function loadMessageDetail(messageId: number) {
    const result = await detailMessage(projectId, messageId);
    if (result) {
      setMessage(result);
    }
  }
  useEffect(() => {
    if (formDrawerOpen && messageId) {
      loadMessageDetail(messageId);
    } else {
      setMessage(null);
    }
  }, [formDrawerOpen, messageId]);
  return (
    <Drawer
      title="推送记录详情"
      width={520}
      onClose={handleCloseMessageDetailDrawer}
      open={formDrawerOpen}
      destroyOnClose
    >
      <Descriptions column={1}>
        <Descriptions.Item label="事件">{message?.title || '-'}</Descriptions.Item>
        <Descriptions.Item label="消息通道">{message?.channel?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="生效时间">
          {message?.createTime ? getLocalFormatDateTime(message?.createTime) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="最后推送时间">
          {message?.lastSentTime ? getLocalFormatDateTime(message?.lastSentTime) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="推送状态">
          {EMessageStatusMap?.[message?.status] || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="消息内容">{null}</Descriptions.Item>
        <div
          style={{
            borderRadius: '2px',
            backgroundColor: '#F7F9FB',
            padding: '8px 12px',
          }}
        >
          {message?.content || '-'}
        </div>
      </Descriptions>
    </Drawer>
  );
};
export default Message;