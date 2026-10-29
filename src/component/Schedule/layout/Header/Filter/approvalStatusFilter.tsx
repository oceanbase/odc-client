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
import { useContext, useMemo } from 'react';
import { Select } from 'antd';
import { ScheduleApprovalStatus } from '@/component/Schedule/interface';
import { ApprovalStatusTextMap } from '@/constant/schedule';

const ApprovalStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { approveStatus } = params || {};

  const handleSelectApprovalStatus = (value) => {
    setParams?.({ approveStatus: value });
  };

  const ApprovalStatusOptions = useMemo(() => {
    return Object.keys(ScheduleApprovalStatus).map((item) => {
      return {
        label: ApprovalStatusTextMap?.[item],
        value: item,
      };
    });
  }, []);

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.3F43CB55',
          defaultMessage: '审批状态',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.038B3C24',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        mode="multiple"
        options={ApprovalStatusOptions || []}
        style={{ width: '100%' }}
        value={approveStatus}
        allowClear
        onChange={handleSelectApprovalStatus}
      />
    </>
  );
};

export default ApprovalStatusFilter;
