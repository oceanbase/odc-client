import { EnvPageType, RiskDetectRuleType } from '@/d.ts';
import { action, observable } from 'mobx';

export class SecureStore {
  /**
   * secure/env page 的 tab
   */
  @observable
  public envPageType: EnvPageType = null;

  @observable
  public riskDetectRuleType: RiskDetectRuleType = null;

  @action
  public changeEnvPageType = (envType: EnvPageType) => {
    this.envPageType = envType;
  };

  @action
  public changeRiskDetectRuleType = (riskDetectRuleType: RiskDetectRuleType) => {
    this.riskDetectRuleType = riskDetectRuleType;
  };
}
export default new SecureStore();
