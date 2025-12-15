import { formatMessage } from '@/util/intl';
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

import { ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Tooltip } from 'antd';

export default function Reload({
  size = '13px',
  onClick,
  style,
}: {
  size?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const [loading, setLoading] = useState(false);
  async function _onClick() {
    setLoading(true);
    await onClick?.();
    setLoading(false);
  }
  if (loading) {
    return (
      <LoadingOutlined
        style={{ fontSize: size, cursor: 'pointer', color: 'var(--icon-color-normal)' }}
      />
    );
  }
  return (
    <Tooltip
      placement="bottom"
      title={formatMessage({ id: 'src.component.Button.Reload.CC20653B', defaultMessage: '刷新' })}
    >
      <ReloadOutlined
        onClick={_onClick}
        style={{ fontSize: size, cursor: 'pointer', color: 'var(--icon-color-normal)', ...style }}
      />
    </Tooltip>
  );
}
