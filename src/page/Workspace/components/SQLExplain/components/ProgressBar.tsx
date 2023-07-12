import { Popover } from 'antd';
import styles from './index.less';
import PopoverContent from './PopoverContent';

const ProgressBar = ({ totalEndTimestamp, totalStartTimestamp, node }) => {
  const total = totalEndTimestamp - totalStartTimestamp;
  const other = (node.startTimestamp - totalStartTimestamp) / total;
  const percent = (node.endTimestamp - node.startTimestamp) / total;
  return (
    <div className={styles.progressBar}>
      <div
        className={styles.transform}
        style={{
          width: `${other * 100}%`,
        }}
      ></div>
      <Popover
        overlayClassName={styles.popover}
        placement="left"
        title={'Execute SQL'}
        content={<PopoverContent node={node} />}
      >
        <div
          className={styles.currentSpan}
          style={{
            width: `${percent * 100}%`,
          }}
        ></div>
      </Popover>
      <div>{node?.endTimestamp - node?.startTimestamp}us</div>
    </div>
  );
};

export default ProgressBar;
