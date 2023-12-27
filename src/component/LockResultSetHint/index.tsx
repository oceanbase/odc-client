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

import { CloseOutlined } from '@ant-design/icons';
import { Component } from 'react';
// @ts-ignore
import styles from './index.less';
import { formatMessage } from '@/util/intl';

export class LockResultSetHint extends Component<{
  onClose(): void;
}> {
  public componentDidMount() {
    const { onClose } = this.props;
    // 10s 后自动消失
    setTimeout(() => {
      onClose();
    }, 10000);
  }

  public render() {
    const { onClose } = this.props;

    return (
      <div className={styles.wrapper}>
        <header className={styles.header}>
          {formatMessage({ id: 'workspace.window.sql.record.notify.title' })}
          <CloseOutlined onClick={onClose} />
        </header>
        <div className={styles.desc}>
          {formatMessage({ id: 'workspace.window.sql.record.notify.desc' })}
        </div>
      </div>
    );
  }
}
