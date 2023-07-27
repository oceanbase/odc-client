import { formatMessage } from '@/util/intl';
export const RiskLevelMap = {
  0: formatMessage({ id: 'odc.page.Secure.interface.DefaultRisk' }), //默认风险
  1: formatMessage({ id: 'odc.page.Secure.interface.LowRisk' }), //低风险
  2: formatMessage({ id: 'odc.page.Secure.interface.MediumRisk' }), //中风险
  3: formatMessage({ id: 'odc.page.Secure.interface.HighRisk' }), //高风险
};

export enum RiskLevelEnum {
  DEFAULT = 0,
  SUGGEST = 1,
  MUST = 2,
}

export const RiskLevelTextMap = {
  [RiskLevelEnum.DEFAULT]: formatMessage({ id: 'odc.page.Secure.interface.NoNeedToImprove' }), //无需改进
  [RiskLevelEnum.SUGGEST]: '需要审批',
  [RiskLevelEnum.MUST]: formatMessage({ id: 'odc.page.Secure.interface.MustBeImproved' }), //必须改进
};
