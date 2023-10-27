import { getDataSourceModeConfig } from '@/common/datasource';
import { TaskType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import setting from '@/store/setting';

export function isSupportExport(session: SessionStore) {
  return (
    setting.enableDBExport &&
    getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(TaskType.EXPORT)
  );
}

export function isSupportPLEdit(session: SessionStore) {
  return getDataSourceModeConfig(session?.odcDatabase?.dataSource?.type)?.features?.plEdit;
}
