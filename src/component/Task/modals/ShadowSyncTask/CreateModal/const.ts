import { formatMessage } from '@/util/intl';

export const rules = {
  name: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.EnterAShadowTableName',
        defaultMessage: '请输入影子表名',
      }),

      //请输入影子表名
    },
    {
      pattern: /^[\w]*$/,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.OnlyEnglishNumbersAndUnderscores',
        defaultMessage: '仅支持英文/数字/下划线',
      }),

      //仅支持英文/数字/下划线
    },
    {
      max: 32,
      message: formatMessage({
        id: 'odc.CreateShadowSyncModal.SelectPanel.NoMoreThanCharacters',
        defaultMessage: '不超过 32 个字符',
      }),

      //不超过 32 个字符
    },
  ],
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateAsyncTaskModal.SelectTaskErrorHandling',
        defaultMessage: '请选择任务错误处理',
      }),

      // 请选择任务错误处理
    },
  ],
};
