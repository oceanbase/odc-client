import { Divider, Progress } from 'antd';
import styles from './index.less';
import classnames from 'classnames';

export default (props) => {
  const { dataSource, topNodes, initialNodes } = props;
  const { duration = [] } = topNodes || {};
  const topNodesList = initialNodes?.filter((i) => [...duration].includes(i?.id));

  const locateNode = (i) => {
    i?.data?.locateNode(i?.id);
  };

  const top5 = () => {
    if (!topNodesList.length) return;
    return (
      <div>
        <h3 style={{ padding: '0px 8px' }}>耗时 Top5</h3>
        {topNodesList?.map((i) => {
          return (
            <div
              className={classnames(styles.top5, {
                [styles.current]: i?.id === dataSource?.data?.id,
              })}
              onClick={() => locateNode(i)}
            >
              <span>
                {i?.data?.name}
                <span style={{ color: 'rgba(0,0,0,0.45)', height: 28 }}>[{i?.id}]</span>
              </span>
              <span>{i?.data?.overview?.['DB Time']}</span>
            </div>
          );
        })}
      </div>
    );
  };
  if (!topNodesList) return null;
  if (!dataSource) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '16px',
          width: '320px',
          backgroundColor: '#FFFFF',
          border: '1px solid #E0E0E0',
          height: 'calc(100% - 142px)',
          overflowY: 'auto',
          padding: '12px 8px',
        }}
        className={styles.customDetailBox}
      >
        {top5()}
      </div>
    );
  }

  const { data } = dataSource;
  if (!data) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: '17px',
        width: '320px',
        backgroundColor: '#FFFFF',
        border: '1px solid #E0E0E0',
        height: 'calc(100% - 142px)',
        overflowY: 'auto',
        padding: '12px 8px',
      }}
      className={styles.customDetailBox}
    >
      <div>
        {top5()}
        {topNodesList.length ? <Divider /> : null}
        <div style={{ padding: '0px 8px' }}>
          <h3>执行概览</h3>
          {data?.percentage === '' ? null : (
            <Progress percent={data?.percentage} showInfo={false} />
          )}
          {data?.overview?.['DB Time'] ? (
            <>
              <div className={styles.customDetailBoxItem}>
                DB 耗时: <span>{data?.overview?.['DB Time']}</span>
              </div>
              <div className={styles.customDetailBoxItem}>
                吐行耗时: <span>{data?.overview?.['Change Time']}</span>
              </div>
            </>
          ) : (
            Object?.entries(data?.overview)?.map(([key, value]) => {
              return (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0px' }}
                >
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              );
            })
          )}
        </div>
        <h3 className={styles.customDetailBoxTitle}>I/O 统计</h3>
        {Object?.entries(data?.statistics)?.map(([key, value]) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px' }}>
              <span>{key}</span>
              <span>{value}</span>
            </div>
          );
        })}
        <h3 className={styles.customDetailBoxTitle}>节点属性</h3>
        {Object?.entries(data?.attributes)?.map(([key, value]) => {
          return (
            <div style={{ padding: '0 8px' }}>
              <h4 className={styles.customDetailBoxSubTitle}>{key}</h4>
              {/* @ts-ignore */}
              {value?.map((i) => (
                <div style={{ padding: '4px 0' }}>{i}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
