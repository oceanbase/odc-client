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
import React, { useContext, useEffect } from 'react';
import { Badge, Radio } from 'antd';
import { TaskTab } from '@/component/Task/interface';
import ParamsContext from '@/component/Task/context/ParamsContext';
import styles from './index.less';
import login from '@/store/login';
import taskStore from '@/store/task';
import { TaskPageType } from '@/d.ts';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context;

  const handleSelect = (e) => {
    setParams({ searchValue: undefined, searchType: undefined, tab: e.target.value as TaskTab });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={params.tab}
      options={[
        {
          label: formatMessage({
            id: 'src.component.Task.layout.Header.79486BBD',
            defaultMessage: '全部',
          }),
          value: TaskTab.all,
        },
        {
          label: (
            <Badge
              count={
                taskStore?.taskPageType === TaskPageType.ALL
                  ? taskStore.pendingApprovalInstanceIds?.length ?? 0
                  : 0
              }
              offset={[8, -3]}
              size="small"
              style={{ zIndex: 999 }}
            >
              <div>
                {formatMessage({
                  id: 'src.component.Task.layout.Header.AEB61F8E',
                  defaultMessage: '待我审批',
                })}
              </div>
            </Badge>
          ),

          value: TaskTab.approveByCurrentUser,
        },
        {
          label: formatMessage({
            id: 'src.component.Task.layout.Header.0A9C5505',
            defaultMessage: '待我执行',
          }),
          value: TaskTab.executionByCurrentUser,
        },
      ]?.filter((item) => {
        if (login.isPrivateSpace() && item.value === TaskTab.approveByCurrentUser) {
          return false;
        }
        return true;
      })}
      defaultValue={TaskTab.all}
      className={styles.tab}
      optionType="button"
    />
  );
};

export default Tabs;
