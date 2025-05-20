import { formatMessage } from '@/util/intl';
import { Rule } from 'antd/es/form';

export const rules = {
  tableName: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.SelectATable',
        defaultMessage: '请选择表',
      }),

      // 请选择表
    },
  ],
  batchSize: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.EnterTheBatchSize',
        defaultMessage: '请输入批处理大小',
      }),

      // 请输入批处理大小
    },
    {
      max: 1000,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.form.TheBatchSizeCannotExceed',
        defaultMessage: '批处理大小不能超过 1000',
      }),

      // 批处理大小不能超过 1000
      type: 'number',
    },
  ],
  columnsRule: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.component.DataMockerDrawer.RuleConfigTable.SelectARule',
        defaultMessage: '请选择规则',
      }), // 请选择规则
    },
  ],
  totalCount: ({ maxMockLimit }): Rule[] => {
    return [
      {
        required: true,
        message: formatMessage({
          id: 'odc.component.DataMockerDrawer.form.EnterTheSimulatedDataVolume',
          defaultMessage: '请输入模拟数据量',
        }),

        // 请输入模拟数据量
      },
      {
        max: maxMockLimit,
        type: 'number',
      },
    ];
  },
};
