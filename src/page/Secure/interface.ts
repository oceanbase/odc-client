export const RiskLevelMap = {
  0: '默认风险',
  1: '低风险',
  2: '中风险',
  3: '高风险',
};

export enum RiskLevelEnum {
  DEFAULT = 0,
  SUGGEST = 1,
  MUST = 2,
}

export const RiskLevelTextMap = {
  [RiskLevelEnum.DEFAULT]: '无需改进',
  [RiskLevelEnum.SUGGEST]: '建议改进',
  [RiskLevelEnum.MUST]: '必须改进',
};
