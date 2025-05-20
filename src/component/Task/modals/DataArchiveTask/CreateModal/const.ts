import { formatMessage } from '@/util/intl';

export const rules = {
  tableName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectTheTable',
        defaultMessage: '请选择表',
      }), //'请选择表'
    },
  ],
  migrationInsertAction: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.DataArchiveTask.CreateModal.PleaseSelectInsertionStrategy',
        defaultMessage: '请选择插入策略',
      }), //'请选择插入策略'
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
