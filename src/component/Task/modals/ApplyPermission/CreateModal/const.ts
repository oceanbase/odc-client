import { formatMessage } from '@/util/intl';

export const rules = {
  applyReason: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseEnterTheReasonDescription',
        defaultMessage: '请输入原因描述',
      }), //'请输入原因描述'
    },
    {
      max: 200,
      message: formatMessage({
        id: 'odc.src.component.Task.ApplyPermission.CreateModal.TheReasonForTheApplication',
        defaultMessage: '申请原因不超过 200 个字符',
      }), //'申请原因不超过 200 个字符'
    },
  ],
  projectId: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
        defaultMessage: '请选择项目',
      }), //'请选择项目'
    },
  ],
  resourceRoleIds: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProjectRole',
        defaultMessage: '请选择项目角色',
      }), //'请选择项目角色'
    },
  ],
};
