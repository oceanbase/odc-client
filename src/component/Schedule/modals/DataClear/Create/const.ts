import { formatMessage } from '@/util/intl';

export const rules = {
  tableName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.DataClearTask.CreateModal.ArchiveRange.PleaseSelect',
        defaultMessage: '请选择',
      }), //请选择
    },
  ],
  unit: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseChoose.1',
          defaultMessage: '请选择',
        }), //'请选择'
      },
    ];
  },
  operator: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseChoose',
          defaultMessage: '请选择',
        }), //'请选择'
      },
    ];
  },
  step: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.src.component.Task.DataClearTask.CreateModal.PleaseEnter',
          defaultMessage: '请输入',
        }), //'请输入'
      },
    ];
  },
};
