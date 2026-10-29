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
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useRef } from 'react';
import { ScheduleStatus } from '@/d.ts/schedule';
import { Button, Divider, Select } from 'antd';
import { ScheduleStatusTextMap } from '@/constant/schedule';
import styles from './index.less';

const ScheduleStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { status } = params || {};
  const handleSelectStatus = (value) => {
    setParams?.({ status: value });
  };

  const statusOptions = useMemo(() => {
    return [
      ScheduleStatus.CREATING,
      ScheduleStatus.ENABLED,
      ScheduleStatus.PAUSE,
      ScheduleStatus.TERMINATED,
      ScheduleStatus.COMPLETED,
    ].map((item) => {
      return {
        label: ScheduleStatusTextMap?.[item],
        value: item,
      };
    });
  }, []);
  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.E43592D9',
          defaultMessage: '作业状态',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.3333BBF3',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={status}
        mode="multiple"
        options={statusOptions || []}
        style={{ width: '100%' }}
        onChange={handleSelectStatus}
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div className={styles.customBatchContainer}>
                {params?.status?.length !== statusOptions?.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus(statusOptions?.map((item) => item.value));
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.Filter.D39866EA',
                      defaultMessage: '全选',
                    })}
                  </div>
                ) : null}
                {params?.status?.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus([]);
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.Filter.11087720',
                      defaultMessage: '清空',
                    })}
                  </div>
                ) : null}
              </div>
            </>
          );
        }}
        allowClear
      />
    </>
  );
};

export default ScheduleStatusFilter;
