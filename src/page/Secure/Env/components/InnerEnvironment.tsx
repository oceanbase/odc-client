import RiskLevelLabel from '@/component/RiskLevelLabel';
import { RuleType } from '@/d.ts/rule';
import { Tabs } from 'antd';
import { memo, useCallback, useContext } from 'react';
import { RiskLevelEnum, RiskLevelTextMap } from '../../interface';
import { EnvironmentContext, IEnvironmentContext } from '../EnvironmentContext';
import EnvironmentInfo from './EnvironmentInfo';
import EnvironmentTable from './EnvironmentTable';
import styles from './index.less';

export const RenderLevel: React.FC<{ level: number }> = ({ level }) => {
  const levelMap = {
    [RiskLevelEnum.DEFAULT]: RiskLevelTextMap[RiskLevelEnum.DEFAULT], //无需改进
    [RiskLevelEnum.SUGGEST]: RiskLevelTextMap[RiskLevelEnum.SUGGEST], //建议改进
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
        <Tabs.TabPane tab={'SQL 检查规范'} key={RuleType.SQL_CHECK}></Tabs.TabPane>
        <Tabs.TabPane tab={'SQL 窗口规范'} key={RuleType.SQL_CONSOLE} />
      </Tabs>
      <div
        style={{
          height: '100%',
          flexGrow: 1,
        }}
      >
        <div style={{ height: '8px' }}></div>
        {environmentContext?.currentEnvironment?.id && <MemoTable />}
      </div>
    </div>
  );
});

export default InnerEnvironment;
