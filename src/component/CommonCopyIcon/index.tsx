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
