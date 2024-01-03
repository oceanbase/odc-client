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

import Icon from '@ant-design/icons';
import classNames from 'classnames';
import React from 'react';

import { Tooltip } from 'antd';
import styles from './index.less';

interface IProps {
  icon: React.ComponentType;
  isActive?: boolean;
  title: string;
  style?: React.CSSProperties;
  onClick: () => void;
}

const ActivityBarButton: React.FC<IProps> = function ({
  icon,
  isActive = false,
  style,
  title,
  onClick,
}) {
  return (
    <Tooltip placement="right" title={title}>
      <Icon
        onClick={onClick}
        style={style}
        className={classNames(styles.icon, { [styles.active]: isActive })}
        component={icon}
      />
    </Tooltip>
  );
};

export default ActivityBarButton;
