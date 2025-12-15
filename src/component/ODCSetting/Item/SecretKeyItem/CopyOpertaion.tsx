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
