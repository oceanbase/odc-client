import { formatMessage } from '@/util/intl';
import { Card } from 'antd';
import styles from './index.less';
const TimeStatistics: React.FC<{
  stackBarBox: React.MutableRefObject<HTMLDivElement>;
}> = ({ stackBarBox }) => {
  return (
    <Card
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.detail.card.time.title',
      })}
      headStyle={{
        padding: '0 16px',
        fontSize: 14,
        border: 'none',
      }}
      bodyStyle={{
        height: 158,
        padding: 16,
      }}
      className={styles.card}
    >
      <div
        ref={stackBarBox}
        style={{
          marginTop: -30,
        }}
      />
    </Card>
  );
};
export default TimeStatistics;
