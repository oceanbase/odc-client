/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  [RiskLevelEnum.SUGGEST]: formatMessage({ id: 'odc.page.Secure.interface.ApprovalRequired' }), //需要审批
  [RiskLevelEnum.MUST]: formatMessage({ id: 'odc.page.Secure.interface.MustBeImproved' }), //必须改进
};
