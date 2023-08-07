import odc from '@/plugins/odc';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import Alert from 'antd/lib/alert';

export default function RAMAuthAlertInfo() {
  return (
    <>
      {odc.appConfig.manage.showRAMAlert?.(setting) && (
        <Alert
          type="info"
          style={{ margin: '12px 0px' }}
          message={
            formatMessage({ id: 'odc.component.RAMAuthAlertInfo.TheCurrentOperationMayConflict' }) //当前操作可能会和 RAM 鉴权中指定的权限范围冲突，请注意风险（用户实际权限取权限合集）。
          }
          showIcon
        />
      )}
    </>
  );
}
