import { formatMessage } from '@/util/intl';

export const rules = {
  delimiter: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.3AA56015',
        defaultMessage: '请输入分隔符',
      }),
    },
  ],
  timeoutMillis: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.5AF8C707',
        defaultMessage: '请输入超时时间',
      }),
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.7BAA8D0E',
        defaultMessage: '最大不超过480小时',
      }),
    },
  ],
  sqlContentType: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FED011D0',
        defaultMessage: '请选择 SQL 内容',
      }),
    },
  ],
  sqlContent: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'src.component.Task.LogicDatabaseAsyncTask.CreateModal.FD315879',
          defaultMessage: '请填写 SQL 内容',
        }),
      },
    ];
  },
};
