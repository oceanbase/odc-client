import { formatMessage } from '@/util/intl';

export const rules = {
  importContent: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.SelectImportContent',
        defaultMessage: '请选择导入内容',
      }),
    },
  ],
  tableName: (required) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.ImportForm.ConfigPanel.TheImportTargetTableCannot',
          defaultMessage: '导入目标表不能为空',
        }),
        //导入目标表不能为空
      },
    ];
  },
  fileType: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.SelectAnImportFormat',
        defaultMessage: '请选择导入格式',
      }),
    },
  ],
  importFileName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.PleaseUploadTheImportedFile',
        defaultMessage: '请上传导入文件',
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
        id: 'odc.ImportForm.formitem.CsvFormItem.YouCanEnterOnlyOne',
        defaultMessage: '只能输入一个字符',
      }), // 只能输入一个字符
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
  batchCommitNum: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.ImportDrawer.ImportForm.EnterTheNumberOfBatch',
        defaultMessage: '请填写批量提交数量',
      }),
    },
  ],
};
