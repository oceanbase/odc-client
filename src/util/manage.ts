import { hasSourceReadAuth, hasSourceWriteAuth } from '@/component/Acess';
import { actionTypes } from '@/d.ts';
import { formatMessage } from './intl';

export const sourceAuthMap = {
  [actionTypes.writeAndReadConnect]: {
    hasSourceAuth: hasSourceWriteAuth,
    title: formatMessage({ id: 'odc.page.Manage.ReadWrite' }), //读写
    value: actionTypes.writeAndReadConnect,
  },

  [actionTypes.readonlyconnect]: {
    hasSourceAuth: hasSourceReadAuth,
    title: formatMessage({ id: 'odc.page.Manage.ReadOnly' }), //只读
    value: actionTypes.readonlyconnect,
  },

  [actionTypes.apply]: {
    hasSourceAuth: hasSourceApplyAuth,
    title: formatMessage({ id: 'odc.page.Manage.CanApply' }), //可申请
    value: actionTypes.apply,
  },
};
export function getSourceAuthLabelString(auths: string[] = []) {
  const label = getSourceAuthLabels(auths)?.join(', ');
  return label || '-';
}
export function getSourceAuthLabels(auths: string[] = []) {
  const labels = [];
  if (hasSourceWriteAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.writeAndReadConnect]);
  }
  if (hasSourceReadAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.readonlyconnect]);
  }
  if (hasSourceApplyAuth(auths)) {
    labels.push(sourceAuthMap[actionTypes.apply]);
  }
  return labels.map((item) => item.title);
}

export function getSourceAuthOptions() {
  return Object.values(sourceAuthMap).map(({ title, value }) => {
    return {
      title,
      value,
    };
  });
}

export function hasSourceApplyAuth(auths: string[] = []) {
  return auths?.includes(actionTypes.apply);
}
