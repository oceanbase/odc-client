import { formatMessage } from '@/util/intl';

export const rules = {
  ['parameters-tableNamesToBeCompared']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.StructureComparisonTask.CreateModal.BCA1854E',
        defaultMessage: '请选择比对对象',
      }), //'请选择对比对象'
    },
  ],
  description: [
    {
      max: 200,
      message: formatMessage({
        id: 'src.component.Task.StructureComparisonTask.CreateModal.FBBFFC4C',
        defaultMessage: '描述不超过 200 个字符',
      }), //'描述不超过 200 个字符'
    },
  ],
};
