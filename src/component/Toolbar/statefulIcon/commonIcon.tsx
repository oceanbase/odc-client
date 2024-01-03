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
import React from 'react';
import { IConStatus, IStatefulIconProps } from '.';

import styles from './index.less';

export default function commonIcon(wrapIconProps: Partial<any>) {
  const CommonIcon: React.FC<IStatefulIconProps> = (props: IStatefulIconProps) => {
    const { type, ...rest } = wrapIconProps;
    const { status, iconProps } = props;
    let IconComponent = Icon;
    if (type) {
      IconComponent = type;
    }
    switch (status) {
      case IConStatus.DISABLE: {
        return <IconComponent className={styles.disable} {...rest} {...iconProps} />;
      }
      case IConStatus.RUNNING: {
        return <IconComponent {...rest} className={styles.loading} {...iconProps} />;
      }
      case IConStatus.INIT:
      default: {
        return <IconComponent {...rest} {...iconProps} />;
      }
    }
  };
  return CommonIcon;
}
