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

import { useContext } from 'react';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { ScheduleSearchType } from '@/component/Schedule/interface';
import { formatMessage } from '@/util/intl';
import InputSelect from '@/component/InputSelect';

const ScheduleSearchTypeText = {
  [ScheduleSearchType.SCHEDULENAME]: formatMessage({
    id: 'src.component.Schedule.layout.Header.314AB098',
    defaultMessage: '作业名称',
  }),
  [ScheduleSearchType.SCHEDULEID]: formatMessage({
    id: 'src.component.Schedule.layout.Header.BDE9EEE6',
    defaultMessage: '作业ID',
  }),
  [ScheduleSearchType.CREATOR]: formatMessage({
    id: 'src.component.Schedule.layout.Header.D4F5ADDE',
    defaultMessage: '创建人',
  }),
  [ScheduleSearchType.DATABASE]: formatMessage({
    id: 'src.component.Schedule.layout.Header.4C818604',
    defaultMessage: '数据库',
  }),
  [ScheduleSearchType.DATASOURCE]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }), //数据源
  [ScheduleSearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [ScheduleSearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
};

const Search = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context;
  const { searchValue, searchType } = params || {};
  const selectTypeOptions = Object.keys(ScheduleSearchType).map((item) => ({
    value: item,
    label: ScheduleSearchTypeText[item],
  }));

  return (
    <InputSelect
      searchValue={searchValue}
      searchType={searchType}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setParams({
          searchValue,
          searchType: searchType as ScheduleSearchType,
        });
      }}
      style={{ minWidth: 160 }}
    />
  );
};

export default Search;
