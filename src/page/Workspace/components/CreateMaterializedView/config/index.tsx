import { ConnectType, ConnectionMode } from '@/d.ts';
import {
  getDataSourceModeConfig,
  getDataSourceModeConfigByConnectionMode,
} from '@/common/datasource';

export function useTableConfig(dialectType: ConnectionMode) {
  return getDataSourceModeConfigByConnectionMode(dialectType)?.schema?.table || {};
}

export function useDataSourceConfig(type: ConnectType) {
  return getDataSourceModeConfig(type);
}
