import { Tag } from 'antd';

export const RiskLevelMap = {
  0: '默认风险',
  1: '低风险',
  2: '中风险',
  3: '高风险',
};

const RiskLevelLabel: React.FC<{ level: number; color: string }> = ({
  level = 0,
  color = 'grey',
}) => <Tag color={color.toLowerCase()}>{RiskLevelMap[level]}</Tag>;

export default RiskLevelLabel;
