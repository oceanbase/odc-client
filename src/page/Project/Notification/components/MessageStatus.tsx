import { IMessage, EMessageStatus } from '@/d.ts/projectNotification';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EllipsisOutlined,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import { EMessageStatusMap } from './interface';

export const MessageStatus: React.FC<{
  message: IMessage;
}> = ({ message }) => {
  const StatusIconMap = {
    [EMessageStatus.CREATED]: {
      icon: (
        <EllipsisOutlined
          style={{
            color: '#ffffff',
            background: 'var(--function-gold6-color)',
            borderRadius: '10px',
            padding: 1,
            fontSize: 10,
          }}
        />
      ),
    },
    [EMessageStatus.SENDING]: {
      icon: (
        <LoadingOutlined
          style={{
            color: 'var(--icon-blue-color)',
          }}
        />
      ),
    },
    [EMessageStatus.SENT_SUCCESSFULLY]: {
      icon: (
        <CheckCircleFilled
          style={{
            color: 'var(--icon-green-color)',
          }}
        />
      ),
    },
    [EMessageStatus.SENT_FAILED]: {
      icon: (
        <CloseCircleFilled
          style={{
            color: 'var(--function-red6-color)',
          }}
        />
      ),
    },
    [EMessageStatus.THROWN]: {
      icon: (
        <StopFilled
          style={{
            color: 'var(--neutral-black45-color)',
          }}
        />
      ),
    },
  };
  return (
    <Space>
      <div>{StatusIconMap?.[message?.status]?.icon}</div>
      <div>{EMessageStatusMap?.[message?.status]}</div>
      {![EMessageStatus.CREATED, EMessageStatus.SENDING, EMessageStatus.SENT_SUCCESSFULLY].includes(
        message?.status,
      ) &&
        message?.errorMessage && (
          <div>
            <Tooltip title={message?.errorMessage}>
              <ExclamationCircleFilled
                style={{
                  color: 'var(--function-gold6-color)',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          </div>
        )}
    </Space>
  );
};
