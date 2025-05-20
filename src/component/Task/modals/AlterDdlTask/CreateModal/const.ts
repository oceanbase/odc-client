import { formatMessage } from '@/util/intl';

export const rules = {
  sqlType: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.SelectAChangeDefinition',
        defaultMessage: '请选择变更定义',
      }), //请选择变更定义
    },
  ],
  sqlContent: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.EnterTheSqlContent',
        defaultMessage: '请填写 SQL 内容',
      }), //请填写 SQL 内容
    },
  ],
  lockTableTimeOutSeconds: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.EnterATimeoutPeriod',
        defaultMessage: '请输入超时时间',
      }), //请输入超时时间
    },
    {
      type: 'number',
      max: 3600,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.UpToSeconds',
        defaultMessage: '最大不超过 3600 秒',
      }), //最大不超过 3600 秒
    },
  ],
  swapTableNameRetryTimes: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.PleaseEnterTheNumberOf',
        defaultMessage: '请输入失败重试次数',
      }), //请输入失败重试次数
    },
  ],
  originTableCleanStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.SelectACleanupPolicy',
        defaultMessage: '请选择清理策略',
      }), //请选择清理策略
    },
  ],
  errorStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.AlterDdlTask.CreateModal.SelectTaskErrorHandling',
        defaultMessage: '请选择任务错误处理',
      }), //请选择任务错误处理
    },
  ],
  swapTableType: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.AlterDdlTask.CreateModal.PleaseSelectTheTableName',
        defaultMessage: '请选择表名切换方式',
      }), //'请选择表名切换方式'
    },
  ],
};

export enum SwapTableType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}
