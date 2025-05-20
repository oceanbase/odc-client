import { formatMessage } from '@/util/intl';

export const rules = {
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.6C651A64',
        defaultMessage: '请选择任务错误处理',
      }), //'请选择任务错误处理'
    },
  ],
  timeoutMillis: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.05B817DF',
        defaultMessage: '请输入超时时间',
      }), //'请输入超时时间'
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.PartitionTask.CreateModal.25D1BD6D',
        defaultMessage: '最大不超过480小时',
      }), //'最大不超过480小时'
    },
  ],
};
