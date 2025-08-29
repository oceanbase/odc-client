import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';

export const rules = {
  sqlContentType: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.SelectSqlContent',
        defaultMessage: '请选择 SQL 内容',
      }),
      //请选择 SQL 内容
    },
  ],
  sqlContent: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'odc.components.CreateSQLPlanTaskModal.EnterTheSqlContent',
          defaultMessage: '请填写 SQL 内容',
        }),
        //请填写 SQL 内容
      },
    ];
  },
  delimiter: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.EnterADelimiter',
        defaultMessage: '请输入分隔符',
      }),
      //请输入分隔符
    },
  ],
  queryLimit: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.PleaseEnterTheQueryResult',
        defaultMessage: '请输入查询结果限制',
      }),
      //请输入查询结果限制
    },
    {
      validator: (_, value) => {
        const max = setting.spaceConfigurations?.['odc.sqlexecute.default.maxQueryLimit'];
        if (value !== undefined && value > max) {
          return Promise.reject(
            formatMessage(
              {
                id: 'src.component.Task.SQLPlanTask.CreateModal.B88FB9EC',
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
  timeoutMillis: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.EnterATimeoutPeriod',
        defaultMessage: '请输入超时时间',
      }),
      //请输入超时时间
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.UpToHours',
        defaultMessage: '最大不超过 480 小时',
      }),
      //最大不超过480小时
    },
  ],
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.SelectTaskErrorHandling',
        defaultMessage: '请选择任务错误处理',
      }),
      //请选择任务错误处理
    },
  ],
  allowConcurrent: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateSQLPlanTaskModal.PleaseSelectTaskExecutionDuration',
        defaultMessage: '请选择任务执行时长超周期处理',
      }), //请选择任务执行时长超周期处理
    },
  ],
};
