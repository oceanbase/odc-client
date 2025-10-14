import { useContext } from 'react';
import { formatMessage } from '@/util/intl';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { TaskSearchType } from '@/component/Task/interface';
import InputSelect from '@/component/InputSelect';

export const TaskSearchTypeText = {
  [TaskSearchType.DESCRIPTION]: '工单描述',
  [TaskSearchType.ID]: '工单ID',
  [TaskSearchType.CREATOR]: '创建人',
  [TaskSearchType.DATABASE]: formatMessage({
    id: 'src.component.ODCSetting.config.9EC92943',
    defaultMessage: '数据库',
  }), //'数据库'
  [TaskSearchType.DATASOURCE]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }), //数据源
  [TaskSearchType.CLUSTER]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [TaskSearchType.TENANT]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
};

const Search = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context;
  const { searchValue, searchType } = params;

  const selectTypeOptions = Object.values(TaskSearchType).map((item) => ({
    value: item,
    label: TaskSearchTypeText[item],
  }));

  return (
    <InputSelect
      searchValue={searchValue}
      searchType={searchType}
      selectTypeOptions={selectTypeOptions}
      onSelect={({ searchValue, searchType }) => {
        setParams({
          searchValue,
          searchType: searchType as TaskSearchType,
        });
      }}
      style={{ minWidth: 160 }}
    />
  );
};

export default Search;
