import { formatMessage } from '@/util/intl';
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

import {
  Badge,
  Checkbox,
  Radio,
  RadioGroupProps,
  Select,
  SelectProps,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import React from 'react';
import styles from './index.less';

export default function SelectItem(props: {
  options: SelectProps['options'];
  value: string;
  onChange: (value: string) => Promise<void>;
  config?: { showDefault: boolean; width: number; mode: 'multiple' | 'tags' };
}) {
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(props.value);

  const optionRender = (option) => {
    const isSelected = selectedValue === option.data.value;

    return (
      <div className={styles.option}>
        <Space>
          <Checkbox />
          {option.data.label}
          {isSelected && (
            <Tag style={{ border: 'none' }}>
              <Typography.Text type="secondary">
                {formatMessage({
                  id: 'src.component.ODCSetting.Item.SelectItem.C99AE9F7',
                  defaultMessage: '默认',
                })}
              </Typography.Text>
            </Tag>
          )}
          <span
            className={styles.setDefault}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedValue(option.data.value);
            }}
          >
            {formatMessage({
              id: 'src.component.ODCSetting.Item.SelectItem.56CA55CD',
              defaultMessage: '设为默认值',
            })}
          </span>
        </Space>
      </div>
    );
  };

  return props?.config?.showDefault ? (
    <Select
      style={{ width: props.config?.width || 140 }}
      tagRender={(tag) => {
        return (
          <Tag className={styles.selectTag} closable onClose={tag.onClose}>
            {tag.label}
            {selectedValue === tag.value
              ? formatMessage({
                  id: 'src.component.ODCSetting.Item.SelectItem.4A6D93E1',
                  defaultMessage: '-默认',
                })
              : ''}
          </Tag>
        );
      }}
      allowClear
      options={props.options}
      key={props.value}
      mode={props?.config?.mode}
      defaultValue={props.value}
      optionLabelProp="label"
      optionRender={optionRender}
      disabled={loading}
      loading={loading}
      onChange={async (value) => {
        setLoading(true);
        try {
          await props.onChange(value);
        } finally {
          setLoading(false);
        }
      }}
    />
  ) : (
    <Select
      style={{ width: props.config?.width || 140 }}
      options={props.options}
      key={props.value}
      defaultValue={props.value}
      optionLabelProp="label"
      disabled={loading}
      loading={loading}
      onChange={async (value) => {
        setLoading(true);
        try {
          await props.onChange(value);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
