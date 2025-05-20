import { formatMessage } from '@/util/intl';

export const rules = {
  dataTransferFormat: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ExportDrawer.ExportForm.SelectExportFormat',
        defaultMessage: '请选择导出格式',
      }),
    },
  ],
  encoding: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.SelectAFileEncoding',
        defaultMessage: '请选择文件编码',
      }),
    },
  ],
  exportFileMaxSize: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ExportForm.ConfigPanel.PleaseFillInOrSelect',
        defaultMessage: '请填写或者选择单个文件上限（MB）',
      }), //请填写或者选择单个文件上限(MB)
    },
    () => ({
      validator: (_, value) => {
        if (
          value ===
          formatMessage({ id: 'odc.ExportForm.ConfigPanel.Unlimited', defaultMessage: '无限制' }) //无限制
        ) {
          return Promise.resolve();
        } else {
          // 当value不为'无限制'时，它的类型可能为string或者number。
          const size = parseInt(value);
          // 当value为011时，它可以转换为整数，但不是我们想要的参数形式，所以使用转换前后的长度来进行比较。
          if (Number.isNaN(size) || size.toString().length !== value.toString().length) {
            return Promise.reject(
              new Error(
                formatMessage({
                  id: 'odc.ExportForm.ConfigPanel.SelectUnlimitedOrEnterA',
                  defaultMessage: '请选择"无限制"或者输入 0 < size <= 2048 范围内的正整数',
                }),
              ), //请选择"无限制"或者输入0 < size <= 2048范围内的正整数
            );
          }
          if (size > 0 && size <= 2048) {
            return Promise.resolve();
          } else {
            return Promise.reject(
              new Error(
                formatMessage({
                  id: 'odc.ExportForm.ConfigPanel.SetTheUpperLimitOf',
                  defaultMessage: '请将单个文件上限设定为 0 < size <= 2048 范围内的正整数',
                }),
              ), //请将单个文件上限设定为0 < size <= 2048范围内的正整数
            );
          }
        }
      },
    }),
  ],
  batchCommitNum: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.ExportDrawer.ExportForm.EnterTheNumberOfBatch',
          defaultMessage: '请填写批量提交数量',
        }),
      },
    ];
  },
  columnSeparator: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.EnterAFieldDelimiter',
        defaultMessage: '请填写字段分隔符',
      }),
    },

    {
      max: 1,
      message: formatMessage({
        id: 'odc.ExportDrawer.ExportForm.YouCanEnterOnlyOne',
        defaultMessage: '只能输入一个字符',
      }),

      // 只能输入一个字符
    },
  ],
  columnDelimiter: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.EnterATextIdentifier',
        defaultMessage: '请填写文本识别符',
      }),
    },
  ],
  lineSeparator: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.EnterALineBreakSymbol',
        defaultMessage: '请填写换行符号',
      }),
    },
  ],
  withDropDDL: [
    {
      required: false,
      message: formatMessage({
        id: 'odc.ExportDrawer.ExportForm.SelectExportContent',
        defaultMessage: '请选择导出内容',
      }),
    },
  ],
  exportContent: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ExportDrawer.ExportForm.SelectExportContent',
        defaultMessage: '请选择导出内容',
      }),
    },
  ],
};
