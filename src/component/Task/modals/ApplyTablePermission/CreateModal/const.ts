import { formatMessage } from '@/util/intl';

export const rules = {
  tables: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.78B63403',
        defaultMessage: '请选择',
      }),
    },
  ],
  types: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.72AFD173',
        defaultMessage: '请选择',
      }),
    },
  ],
  expireTime: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.BC9BE9CE',
        defaultMessage: '请选择',
      }),
    },
  ],
  customExpireTime: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.55D2BC4D',
        defaultMessage: '请选择',
      }),
    },
  ],
  applyReason: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.A92A0F62',
        defaultMessage: '请输入原因描述',
      }),
    },
    {
      max: 200,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.319F7B70',
        defaultMessage: '申请原因不超过 200 个字符',
      }),
    },
  ],
  projectId: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyTablePermission.CreateModal.77D8F632',
        defaultMessage: '请选择项目',
      }),
    },
  ],
};
