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
import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Divider, Select } from 'antd';
import {
  flowStatusSelectOptions,
  PrivateSpaceflowStatusSelectOptions,
  status,
} from '@/component/Task/component/Status';
import { TaskStatus } from '@/d.ts';
import styles from './index.less';
import login from '@/store/login';

const TaskStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { taskStatus } = params || {};

  const taskStatusFilters = useMemo(() => {
    return Object.keys(status)
      ?.filter((key) => {
        if (login.isPrivateSpace()) {
          return PrivateSpaceflowStatusSelectOptions.includes(key as TaskStatus);
        } else {
          return flowStatusSelectOptions.includes(key as TaskStatus);
        }
      })
      .map((key) => ({
        label: status[key].text,
        value: key,
        desc: status[key].desc,
      }));
  }, [status]);

  const handleSelectStatus = (value) => {
    setParams({ taskStatus: value });
  };
  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Task.layout.Header.Filter.906A92D9',
          defaultMessage: '工单状态',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Task.layout.Header.Filter.2C9CC734',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        optionRender={(option) => {
          return (
            <div>
              {option.label}
              {option?.data?.desc}
            </div>
          );
        }}
        labelRender={(option) => {
          return (
            <div>
              {option?.label}
              {status[option?.value]?.desc}
            </div>
          );
        }}
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div className={styles.customBatchContainer}>
                {params.taskStatus.length !== taskStatusFilters.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus(taskStatusFilters?.map((item) => item.value));
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Task.layout.Header.Filter.4CC5A46C',
                      defaultMessage: '全选',
                    })}
                  </div>
                ) : null}
                {params.taskStatus.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus([]);
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Task.layout.Header.Filter.8E3EB745',
                      defaultMessage: '清空',
                    })}
                  </div>
                ) : null}
              </div>
            </>
          );
        }}
        value={taskStatus}
        mode="multiple"
        options={taskStatusFilters}
        style={{ width: '100%' }}
        onChange={handleSelectStatus}
        allowClear
      />
    </>
  );
};
export default TaskStatusFilter;
