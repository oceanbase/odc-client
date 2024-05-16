import { Divider, Progress } from 'antd';
import styles from './index.less';
export default (props) => {
  const { dataSource } = props;
  if (!dataSource) return null;

  const { data } = dataSource;
  // debugger
  if (!data) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: '16px',
        width: '320px',
        backgroundColor: '#FFFFF',
        border: '1px solid #E0E0E0',
        height: 'calc(100% - 140px)',
        overflowY: 'auto',
        padding: '12px 8px',
      }}
      className={styles.customDetailBox}
    >
      <div>
        <div>
          <h3>耗时 Top5</h3>
          // todo 未返回
          {data?.topNodes?.map((i) => {
            return i;
          })}
        </div>
        <Divider />
        <div>
          <h3 className={styles.customDetailBoxTitle}>Node 执行概览</h3>
          <Progress percent={data?.percentage} />
          <div className={styles.customDetailBoxItem}>
            DB 耗时: <span>{data?.overview?.['DB Time']}</span>
          </div>
          <div className={styles.customDetailBoxItem}>
            吐行耗时: <span>{data?.overview?.['Change Time']}</span>
          </div>
        </div>
        <h3 className={styles.customDetailBoxTitle}>I/O 统计</h3>
        {/* <div className={styles.customDetailBoxItem}>这里我忘了</div> */}
        <h3 className={styles.customDetailBoxTitle}>节点属性</h3>
        {Object?.entries(data?.attributes)?.map(([key, value]) => {
          return (
            <div>
              <h4 className={styles.customDetailBoxSubTitle}>{key}</h4>
              {/* @ts-ignore */}
              {value?.map((i) => (
                <div className={styles.customDetailBoxItem}>{i}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
