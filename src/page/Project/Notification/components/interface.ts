import { formatMessage } from '@/util/intl';
import {
  EChannelType,
  ELanguage,
  EMessageStatus,
  ETimeUnit,
  IPolicy,
} from '@/d.ts/projectNotification';

export const TimeUnitMap = {
  [ETimeUnit.MINUTES]: formatMessage({ id: 'src.page.Project.Notification.components.AEB0CAF2' }), //'每分钟'
  [ETimeUnit.HOURS]: formatMessage({ id: 'src.page.Project.Notification.components.AF2822D3' }), //'每小时'
  [ETimeUnit.DAYS]: formatMessage({ id: 'src.page.Project.Notification.components.A8432D68' }), //'每天'
};
export const EChannelTypeMap = {
  [EChannelType.DING_TALK]: formatMessage({
    id: 'src.page.Project.Notification.components.02532812',
  }), //'钉钉'
  [EChannelType.FEI_SHU]: formatMessage({
    id: 'src.page.Project.Notification.components.F80DF1C7',
  }), //'飞书'
  [EChannelType.WE_COM]: formatMessage({ id: 'src.page.Project.Notification.components.A41C487F' }), //'企业微信'
  [EChannelType.WEBHOOK]: '自定义',
};
export const ELanguageMap = {
  [ELanguage.ZH_CN]: '简体中文',
  [ELanguage.ZH_TW]: formatMessage({ id: 'src.page.Project.Notification.components.739AD573' }), //'繁体中文'
  [ELanguage.EN_US]: formatMessage({ id: 'src.page.Project.Notification.components.21BD64D9' }), //'英文'
};
export const EContentTemplateMap = {
  // @oic-line-ignore
  [ELanguage.ZH_CN]:
    '### ODC ${taskType}-${taskStatus}\n- 任务ID: ${taskId}\n- 项目: ${projectName}\n- 数据库: ${databaseName}\n- 发起人: ${creatorName}\n- 触发时间: ${triggerTime}',
  // @oic-line-ignore
  [ELanguage.ZH_TW]:
    '### ODC ${taskType}-${taskStatus}\n- 任務ID: ${taskId}\n- 項目: ${projectName}\n- 數據庫: ${databaseName}\n- 發起人: ${creatorName}\n- 觸發時間: ${triggerTime}',
  // @oic-line-ignore
  [ELanguage.EN_US]:
    '### ODC ${taskType}-${taskStatus}\n- task ID: ${taskId}\n- project: ${projectName}\n- database: ${databaseName}\n- creator: ${creatorName}\n- trigger time: ${triggerTime}',
};
export const EMessageStatusMap = {
  [EMessageStatus.CREATED]: formatMessage({
    id: 'src.page.Project.Notification.components.22049CA8',
  }), //'待发送'
  [EMessageStatus.SENDING]: formatMessage({
    id: 'src.page.Project.Notification.components.590F2E70',
  }), //'发送中'
  [EMessageStatus.SENT_SUCCESSFULLY]: formatMessage({
    id: 'src.page.Project.Notification.components.7C3C69DA',
  }), //'发送成功'
  [EMessageStatus.SENT_FAILED]: formatMessage({
    id: 'src.page.Project.Notification.components.4D27FA10',
  }), //'发送失败'
  [EMessageStatus.THROWN]: formatMessage({
    id: 'src.page.Project.Notification.components.C2F2FE55',
  }), //'忽略'
};
export enum EPolicyFormMode {
  SINGLE = 'SINGLE',
  BATCH = 'BATCH',
}
export type TPolicyForm = {
  mode: EPolicyFormMode;
  policies: IPolicy[];
};
