import { formatMessage } from '@/util/intl';
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

import RiskLevelLabel from '@/component/RiskLevelLabel';
import { RuleType } from '@/d.ts/rule';
import { Tabs, message } from 'antd';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import EnvironmentInfo from './EnvironmentInfo';
import EnvironmentTable from './EnvironmentTable';
import styles from './index.less';
import { IEnvironment } from '@/d.ts/environment';
import { IManagerIntegration } from '@/d.ts';
import { setEnabled } from '@/common/network/env';
import { useState } from 'react';

export const RenderLevel: React.FC<{
  level: number | string;
  extra?: string;
}> = ({ level, extra }) => {
  const levelMap = {
    [RiskLevelEnum.DEFAULT]: RiskLevelTextMap[RiskLevelEnum.DEFAULT],
    //无需改进
    [RiskLevelEnum.SUGGEST]: RiskLevelTextMap[RiskLevelEnum.SUGGEST],
    //建议改进
    [RiskLevelEnum.MUST]: RiskLevelTextMap[RiskLevelEnum.MUST], //必须改进
  };

  const colorMap = {
    [RiskLevelEnum.DEFAULT]: 'green',
    [RiskLevelEnum.SUGGEST]: 'orange',
    [RiskLevelEnum.MUST]: 'red',
  };
  return <RiskLevelLabel content={levelMap[level]} color={colorMap[level]} extra={extra} />;
};
export interface InnerEnvironmentProps {
  currentEnvironment: IEnvironment;
  integrations: IManagerIntegration[];
  integrationsIdMap: Record<string, string>;
  ruleType: RuleType;
  setRuleType: (v: RuleType) => void;
  initEnvironment: (currentEnvironmentId?: number) => void;
  handleUpdateEnvironment: () => void;
  handleDeleteEnvironment: () => void;
}
const InnerEnvironment: React.FC<InnerEnvironmentProps> = ({
  integrations,
  integrationsIdMap,
  currentEnvironment,
  ruleType,
  setRuleType,
  initEnvironment,
  handleUpdateEnvironment,
  handleDeleteEnvironment,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleTabClick = (
    key: string,
    event: React.KeyboardEvent<Element> | React.MouseEvent<Element, MouseEvent>,
  ) => {
    setRuleType(key as RuleType);
  };
  const handleSwitchEnvEnabled = async () => {
    setLoading(true);
    const successful = await setEnabled(currentEnvironment?.id, !currentEnvironment.enabled);
    setLoading(false);
    if (successful) {
      message.success(
        currentEnvironment.enabled
          ? formatMessage({ id: 'src.page.Secure.Env.components.E525BC4C' })
          : formatMessage({ id: 'src.page.Secure.Env.components.213BB360' }),
      );
      await initEnvironment(currentEnvironment?.id);
      return;
    }
    message.error(
      currentEnvironment.enabled
        ? formatMessage({ id: 'src.page.Secure.Env.components.F65C4578' })
        : formatMessage({ id: 'src.page.Secure.Env.components.DF240284' }),
    );
  };
  return (
    <div className={styles.innerEnv}>
      <EnvironmentInfo
        currentEnvironment={currentEnvironment}
        loading={loading}
        handleSwitchEnvEnabled={handleSwitchEnvEnabled}
        handleDeleteEnvironment={handleDeleteEnvironment}
        handleUpdateEnvironment={handleUpdateEnvironment}
      />

      <Tabs
        type="card"
        size="small"
        className={styles.tabs}
        activeKey={ruleType}
        onTabClick={handleTabClick}
        items={[
          {
            key: RuleType.SQL_CHECK,
            label: formatMessage({
              id: 'odc.src.page.Secure.Env.components.SQLCheckSpecification',
            }),
          },
          {
            key: RuleType.SQL_CONSOLE,
            label: formatMessage({
              id: 'odc.src.page.Secure.Env.components.SQLWindowSpecification',
            }),
          },
        ]}
      />

      <div
        style={{
          height: '100%',
          flexGrow: 1,
        }}
      >
        <div
          style={{
            height: '8px',
          }}
        ></div>
        <EnvironmentTable
          key={`${currentEnvironment?.id}_${ruleType}`}
          ruleType={ruleType}
          currentEnvironment={currentEnvironment}
          integrations={integrations}
          integrationsIdMap={integrationsIdMap}
        />
      </div>
    </div>
  );
};
export default InnerEnvironment;
