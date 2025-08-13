import { SubTaskSearchType } from '@/component/Schedule/interface';
import InputSelect from '@/component/InputSelect';
import { formatMessage } from '@/util/intl';
import { useContext, useState } from 'react';
import ParamsContext from '@/component/Schedule/context/ParamsContext';

const ScheduleSearchTypeText = {
  [SubTaskSearchType.ID]: '执行记录 ID',
  [SubTaskSearchType.SCHEDULENAME]: '作业名称',
  [SubTaskSearchType.SCHEDULEID]: '作业ID',
  [SubTaskSearchType.CREATOR]: '创建人',
  [SubTaskSearchType.DATABASE]: formatMessage({
    id: 'src.component.ODCSetting.config.9EC92943',
    defaultMessage: '数据库',
  }), //'数据库'
  [SubTaskSearchType.DATASOURCE]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }), //数据源
  [SubTaskSearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [SubTaskSearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
};

const Search = () => {
  const context = useContext(ParamsContext);
  const { subTaskParams, setsubTaskParams } = context;
  const selectTypeOptions = Object.keys(SubTaskSearchType).map((item) => ({
    value: item,
    label: ScheduleSearchTypeText[item],
  }));
  const { searchValue, searchType } = subTaskParams || {};

  return (
    <InputSelect
      searchValue={searchValue}
      searchType={searchType}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setsubTaskParams({
          searchValue,
          searchType: searchType as SubTaskSearchType,
        });
      }}
    />
  );
};

export default Search;
