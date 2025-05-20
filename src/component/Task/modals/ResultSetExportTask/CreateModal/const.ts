import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { ChineseAndEnglishAndNumberAndUnderline } from '@/util/validRule';

export const rules = {
  ['csvFormat-columnSeparator']: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInTheField',
        defaultMessage: '请填写字段分隔符',
      }), //'请填写字段分隔符'
    },
    {
      max: 1,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.YouCanOnlyEnterOne',
        defaultMessage: '只能输入一个字符',
      }), //'只能输入一个字符'
    },
  ],
  ['csvFormat-columnDelimiter']: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInTheText',
        defaultMessage: '请填写文本识别符',
      }), //'请填写文本识别符'
    },
  ],
  ['csvFormat-lineSeparator']: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInTheChange',
        defaultMessage: '请填写换行符号',
      }), //'请填写换行符号'
    },
  ],
  tableName: [
    {
      required: true,
    },
  ],
  sql: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInSQLContent',
        defaultMessage: '请填写 SQL 内容',
      }), //'请填写 SQL 内容'
    },
  ],
  maxRows: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInTheNumber',
        defaultMessage: '请填写条数限制',
      }), //'请填写条数限制'
    },
    {
      validator: (_, value) => {
        const max = setting.getSpaceConfigByKey('odc.sqlexecute.default.maxQueryLimit');
        if (value !== undefined && Number(value) > max) {
          return Promise.reject(
            formatMessage(
              {
                id: 'src.component.Task.ResultSetExportTask.CreateModal.BD74423A',
                defaultMessage: '不超过查询条数上限 {max}',
              },
              { max },
            ),
          );
        }
        return Promise.resolve();
      },
    },
  ],
  fileName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ResultSetExportTask.CreateModal.PleaseFillInTheFile',
        defaultMessage: '请填写文件名称',
      }), //'请填写文件名称'
    },
    ChineseAndEnglishAndNumberAndUnderline,
  ],
};
