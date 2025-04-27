import { formatMessage } from '@/util/intl';
import { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import { useCountDown } from 'ahooks';

const CopyOperation = ({ password }) => {
  const [countdown, setTargetTime] = useCountDown();

  const handleCopyClick = useCallback(() => {
    if (!password) {
      return;
    }

    copy(password);

    setTargetTime(Date.now() + 3000);
  }, []);

  return (
    <Tooltip
      title={
        countdown > 0
          ? formatMessage({
              id: 'src.component.ODCSetting.Item.SecretKeyItem.0BCDF242',
              defaultMessage: '复制成功',
            })
          : ''
      }
    >
      <Button type="link" style={{ padding: 0, marginRight: 8, gap: 0 }} onClick={handleCopyClick}>
        {countdown > 0 ? <CheckOutlined /> : <CopyOutlined />}
        {formatMessage({
          id: 'src.component.ODCSetting.Item.SecretKeyItem.F18D75FE',
          defaultMessage: '复制密钥',
        })}
      </Button>
    </Tooltip>
  );
};

export default CopyOperation;
