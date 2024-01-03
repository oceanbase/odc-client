/*
 * Copyright 2024 OceanBase
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
import Icon from '@ant-design/icons';
import { message } from 'antd';
import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';
import styles from './index.less';

interface IProps {
  icon: React.ComponentType<any>;
  activeIcon?: React.ComponentType<any>;
  isActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

const IconBtn = forwardRef<HTMLSpanElement, IProps>(function (
  { icon, activeIcon, isActive, style, onClick, className, ...rest },
  ref,
) {
  activeIcon = activeIcon || icon;
  const [loading, setLoading] = useState(false);
  async function _onClick() {
    if (loading) {
      message.warn(
        formatMessage({ id: 'odc.List.IconBtn.InProgressDoNotClick' }), //执行中，请勿重复点击
      );
      return;
    }
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  }
  return (
    <Icon
      ref={ref}
      style={Object.assign({}, style)}
      className={classNames(styles.iconBtn, className, {
        [styles.active]: isActive,
      })}
      component={isActive ? activeIcon : icon}
      onClick={_onClick}
      {...rest}
    />
  );
});

export default IconBtn;
