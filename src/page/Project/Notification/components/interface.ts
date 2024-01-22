import {
  EChannelType,
  ELanguage,
  EMessageStatus,
  ETimeUnit,
  IPolicy,
} from '@/d.ts/projectNotification';

export const TimeUnitMap = {
  [ETimeUnit.MINUTES]: '每分钟',
  [ETimeUnit.HOURS]: '每小时',
  [ETimeUnit.DAYS]: '每天',
};
export const EChannelTypeMap = {
  [EChannelType.DING_TALK]: '钉钉',
  [EChannelType.FEI_SHU]: '飞书',
  [EChannelType.WE_COM]: '微信',
  [EChannelType.WEBHOOK]: '自定义webhook',
};
export const ELanguageMap = {
  [ELanguage.ZH_CN]: '中文',
  [ELanguage.ZH_TW]: '繁体中文',
  [ELanguage.EN_US]: '英文',
};
export const EContentTemplateMap = {
  [ELanguage.ZH_CN]: `### ODC \${taskType}-\${taskStatus}
  - 任务ID: \${taskId}
  - 项目: \${projectName}
  - 数据库: \${databaseName}
  - 发起人: \${creatorName}
  - 触发时间: \${triggerTime}`,
  [ELanguage.ZH_TW]: `### ODC \${taskType}-\${taskStatus}
  - 任務ID: \${taskId}
  - 項目: \${projectName}
  - 數據庫: \${databaseName}
  - 發起人: \${creatorName}
  - 觸發時間: \${triggerTime}`,
  [ELanguage.EN_US]: `### ODC \${taskType}-\${taskStatus}
  - task ID: \${taskId}
  - project: \${projectName}
  - database: \${databaseName}
  - creator: \${creatorName}
  - trigger time: \${triggerTime}`,
};
export const EMessageStatusMap = {
  [EMessageStatus.CREATED]: '待发送',
  [EMessageStatus.SENDING]: '发送中',
  [EMessageStatus.SENT_SUCCESSFULLY]: '发送成功',
  [EMessageStatus.SENT_FAILED]: '发送失败',
  [EMessageStatus.THROWN]: '忽略',
};
export enum EPolicyFormMode {
  SINGLE = 'SINGLE',
  BATCH = 'BATCH',
}
export type TPolicyForm = {
  mode: EPolicyFormMode;
  policies: IPolicy[];
};
