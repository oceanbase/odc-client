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
