import { DatabasePermissionType } from '@/d.ts/database';
import { formatMessage } from '@/util/intl';

export const permissionOptionsMap = {
  [DatabasePermissionType.QUERY]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.8890FE39',
      defaultMessage: '查询',
    }), //'查询'
    docKey: 'ApplyDatabasePermissionQueryTip',
    value: DatabasePermissionType.QUERY,
  },
  [DatabasePermissionType.EXPORT]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.3B7A9E11',
      defaultMessage: '导出',
    }), //'导出'
    docKey: 'ApplyDatabasePermissionExportTip',
    value: DatabasePermissionType.EXPORT,
  },
  [DatabasePermissionType.CHANGE]: {
    text: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.985A0E7F',
      defaultMessage: '变更',
    }), //'变更'
    docKey: 'ApplyDatabasePermissionChangeTip',
    value: DatabasePermissionType.CHANGE,
  },
};

export const expireTimeOptions = [
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.A3DBC09F',
      defaultMessage: '7 天',
    }), //'7 天'
    value: '7,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B4654D83',
      defaultMessage: '30 天',
    }), //'30 天'
    value: '30,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.44988077',
      defaultMessage: '90 天',
    }), //'90 天'
    value: '90,days',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.A383B626',
      defaultMessage: '半年',
    }), //'半年'
    value: '0.5,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.87E335B0',
      defaultMessage: '1 年',
    }), //'1 年'
    value: '1,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.1758E31F',
      defaultMessage: '3 年',
    }), //'3 年'
    value: '3,years',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.35CFABDC',
      defaultMessage: '永不过期',
    }), //'永不过期'
    value: 'never',
  },
  {
    label: formatMessage({
      id: 'src.component.Task.ApplyDatabasePermission.CreateModal.1AAFDFFB',
      defaultMessage: '自定义',
    }), //'自定义'
    value: 'custom',
  },
];

export const rules = {
  projectId: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.564E6CF8',
        defaultMessage: '请选择项目',
      }), //'请选择项目'
    },
  ],
  databases: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.6921F0B1',
        defaultMessage: '请选择数据库',
      }),
    },
  ],
  types: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.75126DC3',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  expireTime: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.3A596C86',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  customExpireTime: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.5FDEC16A',
        defaultMessage: '请选择',
      }), //'请选择'
    },
  ],
  applyReason: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B0247EF7',
        defaultMessage: '请输入原因描述',
      }), //'请输入原因描述'
    },
    {
      max: 200,
      message: formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.7BD59E12',
        defaultMessage: '申请原因不超过 200 个字符',
      }), //'申请原因不超过 200 个字符'
    },
  ],
};
