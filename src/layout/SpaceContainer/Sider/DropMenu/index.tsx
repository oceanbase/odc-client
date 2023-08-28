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

import { Popover } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

interface IProps {
  menu?: JSX.Element;
  small?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const DropMenu: React.FC<IProps> = function ({ children, menu, small, onOpenChange }) {
  return (
    <Popover
      overlayClassName={classNames(styles.dropmenu, { [styles.small]: small })}
      content={menu}
      trigger={['hover']}
      zIndex={1000}
      placement="right"
      onOpenChange={onOpenChange}
    >
      {children}
    </Popover>
  );
};

export default DropMenu;
