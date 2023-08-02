import { Tag } from 'antd';
import { RiskLevelMap } from '../../interface';
import styles from './index.less';

const RiskLevelLabel: React.FC<{ level?: number; color: string; content?: string }> = ({
  level = -1,
  color = 'grey',
  content = '',
}) => (
  <div className={styles.tag}>
    <Tag color={color.toLowerCase()}>{level !== -1 ? RiskLevelMap[level] : content}</Tag>
  </div>
);

export default RiskLevelLabel;
