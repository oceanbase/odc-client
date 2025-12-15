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
import { useContext, useMemo, useRef } from 'react';
import { Divider, Select } from 'antd';
import { useTaskGroup } from '@/component/Task/hooks';
import { TaskConfig } from '@/common/task';
import styles from './index.less';

const TaskTypeFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { taskTypes } = params || {};

  const handleSelectType = (value) => {
    setParams({ taskTypes: value });
  };

  const { results } = useTaskGroup({ taskItems: Object.values(TaskConfig) });

  const taskTypeOptions = useMemo(() => {
    if (results.length) {
      let options = [];
      results.forEach((item) => {
        if (item.label) {
          options.push(...item.children);
        }
      });
      return options;
    }
    return [];
  }, [results]);

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Task.layout.Header.Filter.8D1AE189',
          defaultMessage: '工单类型',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Task.layout.Header.Filter.E57A4260',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={taskTypeOptions}
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div className={styles.customBatchContainer}>
                {params.taskTypes.length !== taskTypeOptions.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectType(taskTypeOptions?.map((item) => item.value));
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Task.layout.Header.Filter.902A2527',
                      defaultMessage: '全选',
                    })}
                  </div>
                ) : null}
                {params.taskTypes.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectType([]);
                    }}
                  >
                    {formatMessage({
                      id: 'src.component.Task.layout.Header.Filter.FFB6976A',
                      defaultMessage: '清空',
                    })}
                  </div>
                ) : null}
              </div>
            </>
          );
        }}
        style={{ width: '100%' }}
        value={taskTypes}
        mode="multiple"
        allowClear
        onChange={handleSelectType}
      />
    </>
  );
};
export default TaskTypeFilter;
