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
import { Checkbox, Input } from 'antd';
import classnames from 'classnames';
import React, { ReactNode, useState } from 'react';

import styles from './index.less';

interface IProps {
  title: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
  enableSelectAll?: boolean;
  indeterminate?: boolean;
  checked?: boolean;
  onSearch: (searchValue: string) => void;
  onSelectAll?: (e) => void;
}

const Card: React.FC<IProps> = function ({
  title,
  extra,
  disabled,
  checked,
  enableSelectAll = false,
  indeterminate,
  children,
  onSearch,
  onSelectAll,
}) {
  const [searchValue, _setSearchValue] = useState('');
  function setSearchValue(v) {
    onSearch?.(v);
  }

  return (
    <div className={classnames(styles.card, { [styles.cardDisabled]: disabled })}>
      <div className={styles.header}>
        <div>{title}</div>
        <div>{extra}</div>
      </div>
      <div className={styles.search}>
        {enableSelectAll && (
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={onSelectAll}
            style={{ marginRight: '8px' }}
          />
        )}

        <Input.Search
          placeholder={formatMessage({
            id: 'odc.ExportSelecter.ExportCard.SearchKeywords',
            defaultMessage: '搜索关键字',
          })} /*搜索关键字*/
          style={{ width: '100%' }}
          onSearch={(v) => {
            setSearchValue(v);
          }}
          onBlur={(e) => {
            setSearchValue(e.target.value);
          }}
        />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
