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

import React from 'react';

import Action from '@/component/Action';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import styles from './index.less';

interface IProps {
  title: React.ReactNode;
  desc?: React.ReactNode;
  icon: React.ReactNode;
  actions: {
    icon: IconComponentProps['component'];
    title: string;
    onClick: () => void;
  }[];
  actionSize?: number;
  onClick?: () => void;
}

export default function ListItem({ title, actionSize, desc, icon, actions, onClick }: IProps) {
  actionSize = actionSize || 1;

  return (
    <div
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'unset' }}
      className={styles.item}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {desc ? <div className={styles.desc}>{desc}</div> : null}
      </div>
      {!!actions?.length && (
        <div className={styles.actions}>
          <Action.Group ellipsisIcon="vertical" size={actionSize || 1}>
            {actions?.map((action, i) => {
              return (
                <Action.Link tooltip={action.title} key={i} onClick={action.onClick}>
                  {actionSize < i + 1 ? (
                    action.title
                  ) : (
                    <Icon className={styles.icon} component={action.icon} />
                  )}
                </Action.Link>
              );
            })}
          </Action.Group>
        </div>
      )}
    </div>
  );
}
