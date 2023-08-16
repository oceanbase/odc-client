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
import { Tabs } from 'antd';
import { memo, useCallback, useContext } from 'react';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import { EnvironmentContext, IEnvironmentContext } from '../EnvironmentContext';
import EnvironmentInfo from './EnvironmentInfo';
import EnvironmentTable from './EnvironmentTable';
import styles from './index.less';
export const RenderLevel: React.FC<{
  level: number;
}> = ({ level }) => {
  const levelMap = {
    [RiskLevelEnum.DEFAULT]: RiskLevelTextMap[RiskLevelEnum.DEFAULT],
    //无需改进
    [RiskLevelEnum.SUGGEST]: RiskLevelTextMap[RiskLevelEnum.SUGGEST],
    //建议改进
    [RiskLevelEnum.MUST]: RiskLevelTextMap[RiskLevelEnum.MUST], //必须改进
  };

  const colorMap = {
    [RiskLevelEnum.DEFAULT]: 'green',
    [RiskLevelEnum.SUGGEST]: 'yellow',
    [RiskLevelEnum.MUST]: 'red',
  };
  return <RiskLevelLabel content={levelMap[level]} color={colorMap[level]} />;
};
interface InnerEnvironmentProps {
  ruleType: RuleType;
  setRuleType: (v: RuleType) => void;
}
const InnerEnvironment = memo(({ ruleType, setRuleType }: InnerEnvironmentProps) => {
  const environmentContext = useContext<IEnvironmentContext>(EnvironmentContext);
  const handleTabClick = (
    key: string,
    event: React.KeyboardEvent<Element> | React.MouseEvent<Element, MouseEvent>,
  ) => {
    setRuleType(key as RuleType);
  };
  const MemoTable = useCallback(
    () =>
      EnvironmentTable({
        ruleType,
      }),
    [ruleType, environmentContext?.currentEnvironment],
  );
  return (
    <div className={styles.innerEnv}>
      <EnvironmentInfo
        label={environmentContext?.currentEnvironment?.name}
        style={environmentContext?.currentEnvironment?.style}
        description={environmentContext?.currentEnvironment?.description}
      />
      <Tabs
        type="card"
        size="small"
        className={styles.tabs}
        activeKey={ruleType}
        onTabClick={handleTabClick}
      >
        <Tabs.TabPane
          tab={
            formatMessage({
              id: 'odc.src.page.Secure.Env.components.SQLCheckSpecification',
            }) //'SQL 检查规范'
          }
          key={RuleType.SQL_CHECK}
        ></Tabs.TabPane>
        <Tabs.TabPane
          tab={
            formatMessage({
              id: 'odc.src.page.Secure.Env.components.SQLWindowSpecification',
            }) //'SQL 窗口规范'
          }
          key={RuleType.SQL_CONSOLE}
        />
      </Tabs>
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
        {environmentContext?.currentEnvironment?.id && <MemoTable />}
      </div>
    </div>
  );
});
export default InnerEnvironment;
