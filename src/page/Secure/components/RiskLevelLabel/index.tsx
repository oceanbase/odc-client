import { Tag } from 'antd';
import { RiskLevelMap } from '../../interface';

const RiskLevelLabel: React.FC<{ level: number; color: string }> = ({
  level = 0,
  color = 'grey',
}) => <Tag color={color.toLowerCase()}>{RiskLevelMap[level]}</Tag>;

export default RiskLevelLabel;
