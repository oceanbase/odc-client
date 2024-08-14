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

import { ReactComponent as ODCBlackSvg } from '@/svgr/odc_logo_color.svg';
import { isClient } from '@/util/env';
import Icon, { HomeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useState } from 'react';
import styles from './index.less';

export default function Logo() {
  const [isHover, setHoverSatate] = useState<boolean>(false);

  const backToHome = () => {
    if (isClient()) return;
    window.open(location.origin + '/#/project');
  };

  return (
    <span
      onClick={backToHome}
      className={styles.logo}
      onMouseEnter={() => setHoverSatate(true)}
      onMouseLeave={() => setHoverSatate(false)}
    >
      {isHover && !isClient() ? (
        <Tooltip title={'返回首页'} placement="right">
          <Icon
            component={HomeOutlined}
            style={{
              fontSize: 16,
              padding: 6,
              backgroundColor: 'var(--hover-color)',
              cursor: 'pointer',
            }}
          />
        </Tooltip>
      ) : (
        <Icon component={ODCBlackSvg} style={{ fontSize: 16, padding: 6 }} />
      )}
    </span>
  );
}
