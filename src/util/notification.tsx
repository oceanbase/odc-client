import { formatMessage } from '@/util/intl';
import { Modal, notification } from 'antd';
import { useCallback, useState } from 'react';
import { generateUniqKey } from './utils';
export interface DescriptionProps {
  description: string;
  requestId?: string | number;
  isComponent?: boolean;
  extraMessageParams?: {
    [key in string]: string;
  };
}
function ExtraMessage(props: {
  extraMessageParams: {
    [key in string]: string;
  };
}) {
  const { extraMessageParams } = props;

  return (
    <>
      <div>
        <strong>报错信息:</strong>
      </div>
      {Object.keys(extraMessageParams).map(
        (key, index) =>
          extraMessageParams[key] !== '' && (
            <div key={index}>
              <span style={{ color: 'var(--text-color-hint)' }}>{key}</span>:{' '}
              <span>{extraMessageParams[key]}</span>
            </div>
          ),
      )}
    </>
  );
}
function Description(props: DescriptionProps) {
  const { description, requestId, isComponent = true, extraMessageParams = {} } = props;
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = useCallback(() => {
    if (isOpen) {
      return;
    }
    Modal.info({
      zIndex: 1011,
      title: formatMessage({ id: 'odc.src.util.notification.Details' }), // 详情
      content: <div>{description}</div>,
      onCancel: () => {
        setIsOpen(false);
      },
      onOk: () => {
        setIsOpen(false);
      },
    });

    setIsOpen(true);
  }, [description, isOpen]);

  if (!description) {
    return (
      <span>
        {
          formatMessage({
            id: 'odc.src.util.notification.NoErrorMessage',
          })
          /* 无错误信息 */
        }
      </span>
    );
  }
  let isEllipsis = false;
  let ellipsisText = description.substring(0, 200);
  if (ellipsisText.length < description.length) {
    isEllipsis = true;
    ellipsisText += '...';
  }
  return (
    <span>
      {!!requestId && (
        <div style={{ color: 'var(--text-color-hint)' }}>
          {formatMessage({ id: 'odc.src.util.notification.RequestId' }) /*请求Id：*/}
          {requestId}
        </div>
      )}

      {ellipsisText}
      {isComponent && <ExtraMessage {...{ extraMessageParams }} />}
      {isEllipsis ? (
        <a onClick={openDetail}>
          {
            formatMessage({
              id: 'odc.src.util.notification.Details',
            }) /* 详情 */
          }
        </a>
      ) : null}
    </span>
  );
}

/**
 * description: notificationKey
 */
const notificationCache = new Map<string, string>();
interface ErrorParams {
  track?: string;
  supportRepeat?: boolean;
  holdErrorTip?: boolean;
  requestId?: string | number;
  extraMessage?: {
    isComponent?: boolean;
    ComponentMessageParams?: {
      [key in string]?: any;
    };
  };
}
interface WarnParams {
  description: string;
  supportRepeat?: boolean;
  durationOption?: number;
  requestId?: string | number;
}
export default {
  error(errorParams: ErrorParams) {
    const {
      track: description = '',
      supportRepeat = true,
      holdErrorTip = false,
      requestId,
      extraMessage,
    } = errorParams;
    /**
     * 最小 4.5，最大 20 秒，其余情况 length * 0.1s
     */
    const key = generateUniqKey();
    let duration = holdErrorTip ? 9999 : Math.max(Math.min(20, description.length * 0.1), 4.5);
    if (extraMessage.isComponent) {
      duration = 5;
    }
    if (!supportRepeat && notificationCache.has(description)) {
      notification.close(notificationCache.get(description));
    }
    notification.error({
      message: formatMessage({ id: 'odc.src.util.notification.RequestFailed' }), // 请求失败
      description: (
        <Description description={description} requestId={requestId} {...extraMessage} />
      ),
      duration,
      key,
      onClose: () => {
        notificationCache.delete(description);
      },
    });

    notificationCache.set(description, key);
  },
  warn(
    description: string = '',
    supportRepeat: boolean = true,
    durationOption: number = 4.5,
    requestId = '',
  ) {
    /**
     * 最小 4.5，最大 20 秒，其余情况 length * 0.1s
     */
    const key = generateUniqKey();
    const duration = Math.max(Math.min(20, description.length * 0.1), durationOption);
    if (!supportRepeat && notificationCache.has(description)) {
      notification.close(notificationCache.get(description));
    }
    notification.warn({
      message: formatMessage({ id: 'odc.src.util.notification.Cue' }), // 提示
      description: <Description description={description} requestId={requestId} />,
      duration,
      key,
      onClose: () => {
        notificationCache.delete(description);
      },
    });

    notificationCache.set(description, key);
  },
};
