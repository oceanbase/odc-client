import { Segmented, Tooltip } from 'antd';
import { useContext } from 'react';
import { Perspective } from '@/component/Schedule/interface';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import styles from './index.less';

const Segment = () => {
  const context = useContext(ParamsContext);
  const { perspective, setPerspective, setLoading } = context;
  return (
    <Segmented
      value={perspective}
      onChange={(value) => {
        setLoading(true);
        setPerspective(value);
      }}
      className={styles.segmented}
      options={[
        {
          value: Perspective.scheduleView,
          icon: (
            <Tooltip
              title={
                <>
                  <div>作业视角</div>
                  <div>展示所有作业创建记录</div>
                </>
              }
            >
              作业视角
            </Tooltip>
          ),
        },

        {
          value: Perspective.executionView,
          icon: (
            <Tooltip
              title={
                <>
                  <div>执行视角</div>
                  <div>展示所有作业的任务执行记录</div>
                </>
              }
            >
              执行视角
            </Tooltip>
          ),
        },
      ]}
    />
  );
};

export default Segment;
