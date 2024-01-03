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

import { Radio, Space } from 'antd';
import React from 'react';
import styles from '../index.less';
import type { ITitleContent } from '../interface';

interface IProps extends ITitleContent {
  onTabChange: (value: string) => void;
}

export const TitleContent: React.FC<IProps> = (props) => {
  const { tabs, title = '', description = '', wrapperClass } = props ?? {};
  return (
    <Space className={styles.titleContent}>
      {!!tabs && (
        <Radio.Group
          value={tabs.value || tabs?.options?.[0]?.value}
          options={tabs.options}
          onChange={(e) => {
            props.onTabChange(e.target.value);
          }}
          optionType="button"
        />
      )}
      {!!title && <div className={`${styles.title} ${wrapperClass}`}>{title}</div>}
      {!!description && <span className={styles.desc}>{description}</span>}
    </Space>
  );
};
