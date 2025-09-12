import { useContext } from 'react';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { ScheduleSearchType } from '@/component/Schedule/interface';
import { formatMessage } from '@/util/intl';
import InputSelect from '@/component/InputSelect';

const ScheduleSearchTypeText = {
  [ScheduleSearchType.SCHEDULENAME]: '作业名称',
  [ScheduleSearchType.SCHEDULEID]: '作业ID',
  [ScheduleSearchType.CREATOR]: '创建人',
  [ScheduleSearchType.DATABASE]: '数据库',
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
    />
  );
};

export default Search;
