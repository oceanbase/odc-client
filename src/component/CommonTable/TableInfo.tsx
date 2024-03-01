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
import { Alert, Space } from 'antd';
import React from 'react';
import styles from './index.less';
import type { IRowSelecter } from './interface';

interface IProps<T> extends IRowSelecter<T> {
  selectedRowKeys: string[];
  onCancelSelect: () => void;
  onSelectAllRows: () => void;
}

export const TableInfo: React.FC<IProps<unknown>> = (props) => {
  const { options, selectedRowKeys, hideSelectAll, onCancelSelect, onSelectAllRows } = props;
  return (
    <div className={styles.infoWrap}>
      <Alert
        message={
          <Space>
            <span>
              {
                formatMessage(
                  {
                    id: 'odc.component.CommonTable.TableInfo.SelectedrowkeyslengthIsSelected',
                  },

                  { selectedRowKeysLength: selectedRowKeys.length },
                )
                /*已选择{selectedRowKeysLength}项*/
              }
            </span>
            {!hideSelectAll && (
              <span className={styles.btn} onClick={onSelectAllRows}>
                {
                  formatMessage({
                    id: 'odc.component.CommonTable.TableInfo.SelectAll',
                  }) /*全选所有*/
                }
              </span>
            )}
            <span className={styles.btn} onClick={onCancelSelect}>
              {
                formatMessage({
                  id: 'odc.component.CommonTable.TableInfo.Deselect',
                })
                /*取消选择*/
              }
            </span>
          </Space>
        }
        type="info"
        action={
          <Space>
            {options?.map(({ okText, onOk }, index) => {
              return (
                <span
                  key={index}
                  className={styles.btn}
                  onClick={() => {
                    onOk(selectedRowKeys);
                  }}
                >
                  {okText}
                </span>
              );
            })}
          </Space>
        }
      />
    </div>
  );
};
