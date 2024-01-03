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
/**
 *
 * 下拉筛选器（支持功能：搜索，全选，取消全选，取消，提交）
 */
import { Button, Checkbox, Empty, Input, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/lib/table/interface';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';

export const EmptyLabel: React.FC<{ label?: string }> = ({
  label = formatMessage({ id: 'odc.component.CommonFilter.Null' }), // (空)
}) => {
  return <span style={{ color: 'var(--text-color-primary)' }}>{label}</span>;
};

interface IProps extends FilterDropdownProps {
  filters: any;
  selectedKeys: any;
}

const CommonFilter: React.FC<IProps> = (props) => {
  const { filters, selectedKeys, confirm, setSelectedKeys } = props;
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<number[]>(Array.from(selectedKeys ?? []));

  const options = useMemo(() => {
    return filters?.filter(({ label }) => {
      return typeof label === 'string'
        ? label?.toLowerCase().indexOf(searchValue?.toLowerCase() || '') > -1
        : true;
    });
  }, [filters, searchValue]);

  useEffect(() => {
    setSelectedValues(Array.from(selectedKeys ?? []));
  }, [selectedKeys]);

  const optionsValue = options?.map(({ value }) => value);

  const handleSelectAll = () => {
    const values = new Set([].concat(optionsValue || []).concat(selectedValues || []));
    setSelectedValues(Array.from(values));
  };

  const handleDeselectAll = () => {
    setSelectedValues(selectedValues?.filter((item) => !optionsValue?.some((v) => item === v)));
  };

  const handleCancel = () => {
    confirm();
    setSelectedKeys(selectedKeys);
    setSearchValue('');
  };

  const handleOk = () => {
    setSelectedKeys(selectedValues);
    confirm();
  };

  return (
    <div className={styles.commonFilter}>
      <Space direction="vertical">
        <Input.Search
          autoFocus
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
        />

        <div className={styles.filters}>
          {!options?.length ? (
            <Empty />
          ) : (
            <Checkbox.Group
              options={options}
              value={selectedValues}
              onChange={(v) => {
                setSelectedValues(v as any);
              }}
            />
          )}
        </div>
        <div className={styles.footer}>
          <Space>
            <a onClick={handleSelectAll}>
              {
                formatMessage({
                  id: 'odc.component.CommonFilter.SelectAll',
                }) /* 全选 */
              }
            </a>
            <a onClick={handleDeselectAll}>
              {
                formatMessage({
                  id: 'odc.component.CommonFilter.CancelAll',
                }) /* 取消全选 */
              }
            </a>
          </Space>
          <Space>
            <Button onClick={handleCancel}>
              {
                formatMessage({
                  id: 'odc.component.CommonFilter.Cancel',
                }) /* 取消 */
              }
            </Button>
            <Button onClick={handleOk} type="primary">
              {
                formatMessage({
                  id: 'odc.component.CommonFilter.Determine',
                }) /* 确定 */
              }
            </Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default CommonFilter;
