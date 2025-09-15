import { formatMessage } from '@/util/intl';
import { DatabaseSearchType } from '@/d.ts/database';

export const DatabaseSearchTypeText = {
  [DatabaseSearchType.SCHEMA_NAME]: formatMessage({
    id: 'src.component.ODCSetting.config.9EC92943',
    defaultMessage: '数据库',
  }), //'数据库'
  [DatabaseSearchType.DATASOURCE_NAME]: formatMessage({
    id: 'odc.component.RecordPopover.column.DataSource',
    defaultMessage: '数据源',
  }), //数据源
  [DatabaseSearchType.CLUSTER_NAME]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Cluster',
    defaultMessage: '集群',
  }), //集群
  [DatabaseSearchType.TENANT_NAME]: formatMessage({
    id: 'odc.Connecion.ConnectionList.ParamContext.Tenant',
    defaultMessage: '租户',
  }), //租户
};
