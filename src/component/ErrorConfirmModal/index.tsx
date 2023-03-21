import type { ODCErrorsCode } from '@/d.ts';
import loginStore from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Modal } from 'antd';
import { history } from 'umi';

const lockStore = {
  PermissionChanged: null,
  LoginExpired: null,
};

export function clearModalConfirm(errCode: ODCErrorsCode) {
  const modalIns = lockStore[errCode];
  if (modalIns) {
    modalIns.destroy();
    lockStore[errCode] = null;
  }
}

const ErrorInfoMap = {
  PermissionChanged: {
    title: formatMessage({
      id: 'odc.component.ErrorConfirmModal.PermissionChange',
    }), // 权限变更
    content: formatMessage({
      id: 'odc.component.ErrorConfirmModal.ThePermissionHasChangedPlease',
    }), // 权限发生变化，请重试
    handleOk: () => {
      history.push(`/connections`);
    },
  },

  LoginExpired: {
    title: formatMessage({
      id: 'odc.component.ErrorConfirmModal.LogonTimeout',
    }), // 登录超时
    content: formatMessage({
      id: 'odc.component.ErrorConfirmModal.LoginTimedOutPleaseLog',
    }), // 登录超时，请重新登录
    handleOk: () => {
      loginStore.gotoLoginPage();
    },
  },
};

export default function showErrorConfirmModal(errCode: ODCErrorsCode, errMsg?: string) {
  const data: {
    title: string;
    content: string;
    handleOk: () => void;
  } = ErrorInfoMap[errCode];
  if (lockStore[errCode]) {
    return;
  }
  lockStore[errCode] = Modal.confirm({
    centered: true,
    title: data.title,
    content: errMsg || data.content,
    okText: formatMessage({ id: 'odc.component.ErrorConfirmModal.Determine' }), // 确定
    zIndex: 1033,
    onOk: () => {
      data.handleOk();
      lockStore[errCode] = null;
    },
    onCancel: () => {
      lockStore[errCode] = null;
    },
  });
}
