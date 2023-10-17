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
import { DbObjectTypeTextMap } from '@/constant/label';
import { DbObjectType } from '@/d.ts';
import Icon, { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input, Space } from 'antd';
import { BaseSelectRef } from 'rc-select';
import React, { useRef, useState } from 'react';
import styles from './index.less';
interface IProps {
  onChange: (type: DbObjectType, value: string) => void;
}
const splitKey = Symbol('dbSearch').toString();
const DatabaseSearch: React.FC<IProps> = function ({ onChange }) {
  const [inputValue, setInputValue] = useState<string>(null);
  const [tmpValue, setTmpValue] = useState<string>(null);
  const [isFocus, setIsFocus] = useState(false);
  const ref = useRef<BaseSelectRef>();
  const [dbType, textValue] = inputValue?.split(splitKey) || [];
  const options = tmpValue
    ? [
        DbObjectType.database,
        DbObjectType.table,
        DbObjectType.view,
        DbObjectType.function,
        DbObjectType.procedure,
        DbObjectType.package,
        DbObjectType.trigger,
        DbObjectType.type,
        DbObjectType.sequence,
        DbObjectType.synonym,
        DbObjectType.public_synonym,
      ].map((type) => {
        return {
          value: type + splitKey + tmpValue,
          label: (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {tmpValue}
              </div>
              <div
                style={{
                  flexShrink: 0,
                  flexGrow: 0,
                  color: 'var(--text-color-hint)',
                }}
              >
                {DbObjectTypeTextMap[type]}
              </div>
            </div>
          ),
        };
      })
    : [];
  return (
    <AutoComplete
      ref={ref}
      style={{
        width: '100%',
      }}
      options={options}
      value={isFocus ? tmpValue : textValue}
      defaultActiveFirstOption
      onClear={() => {
        setInputValue('');
        onChange(null, null);
      }}
      onChange={(value, option) => {
        if ('value' in option) {
          return;
        }
        setTmpValue(value);
      }}
      onSelect={(v) => {
        const [dbType, value] = v.split(splitKey);
        ref.current?.blur();
        setInputValue(v);
        onChange(dbType as DbObjectType, value);
      }}
      onFocus={() => {
        setIsFocus(true);
        setTmpValue(textValue);
      }}
      onBlur={() => {
        setIsFocus(false);
        setTmpValue(null);
      }}
    >
      <Input
        style={{
          width: '100%',
        }}
        suffix={
          <Space size={4}>
            {inputValue ? (
              <Icon
                className={styles.closeIcon}
                component={CloseCircleFilled}
                onClick={(e) => {
                  setInputValue('');
                  setTmpValue(null);
                  ref.current?.blur();
                  e.stopPropagation();
                  onChange(null, null);
                }}
              />
            ) : null}
            <span
              style={{
                color: 'var(--text-color-placeholder)',
              }}
            >
              {DbObjectTypeTextMap[dbType] || ''}
            </span>
            <SearchOutlined />
          </Space>
        }
        size="small"
        placeholder={
          formatMessage({
            id: 'odc.src.page.Workspace.SideBar.ResourceTree.DatabaseSearch.SearchDatabaseObject',
          }) /* 搜索数据库对象 */
        }
      />
    </AutoComplete>
  );
};
export default DatabaseSearch;
