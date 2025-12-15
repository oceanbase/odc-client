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
import { useContext } from 'react';
import { Radio } from 'antd';
import { ScheduleTab } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import styles from './index.less';

const Tabs = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};

  const handleSelect = (e) => {
    setParams?.({
      searchValue: undefined,
      searchType: undefined,
      tab: e.target.value as ScheduleTab,
    });
  };

  return (
    <Radio.Group
      onChange={handleSelect}
      value={params?.tab}
      options={[
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.4060D379',
            defaultMessage: '全部',
          }),
          value: ScheduleTab.all,
        },
        {
          label: formatMessage({
            id: 'src.component.Schedule.layout.Header.D7D546CD',
            defaultMessage: '待我审批',
          }),
          value: ScheduleTab.approveByCurrentUser,
        },
      ]}
      defaultValue={ScheduleTab.all}
      className={styles.tab}
      optionType="button"
    />
  );
};
export default Tabs;
