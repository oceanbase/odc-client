import connection from '@/store/connection';
import modalStore from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Modal } from 'antd';
export default function showSysAccountConfigModal(isSysError: boolean = false) {
  Modal.confirm({
    centered: true,
    title: formatMessage({ id: 'odc.component.SysAccountConfigModal.Cue' }), //提示
    content: isSysError
      ? formatMessage({ id: 'odc.component.SysAccountConfigModal.ThisFeatureRequiresAccessTo' }) //该功能需要访问 sys 租户视图，root@sys 账号连通性检查未通过
      : formatMessage({ id: 'odc.component.SysAccountConfigModal.ToAccessTheSysTenant' }), //该功能需要访问 sys 租户视图，请配置 root@sys 账号信息
    okText: formatMessage({ id: 'odc.component.SysAccountConfigModal.Configure' }), //去配置
    onOk: () => {
      const sid = connection.sessionId.split('-')[0];
      modalStore.changeAddConnectionModal(true, {
        data: { ...connection.connection, sid },
        isEdit: true,
        resetConnect: true,
        forceSys: true,
      });
    },
  });
}
