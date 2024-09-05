import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';

import { CheckOutlined } from '@ant-design/icons';

interface IProps {
  tooltipText?: string;
  text: string;
  onCopy: (_, result: boolean) => void;
}

const CommonCopyIcon = ({ tooltipText = null, text, onCopy }: IProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  return (
    <Tooltip title={tooltipText}>
      <CopyToClipboard text={text} onCopy={onCopy}>
        {copied ? (
          <CheckOutlined style={{ color: 'var(--icon-green-color)' }} />
        ) : (
          <CopyOutlined
            onClick={() => setCopied(true)}
            style={{ color: 'var(--icon-blue-color)' }}
          />
        )}
      </CopyToClipboard>
    </Tooltip>
  );
};

export default CommonCopyIcon;
