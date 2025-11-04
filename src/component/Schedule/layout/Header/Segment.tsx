import { formatMessage } from '@/util/intl';
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
      options={[
        {
          value: Perspective.scheduleView,
          icon: (
            <Tooltip
              overlayClassName={styles.filterTooltip}
              title={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.07E87B79',
                      defaultMessage: '作业视角',
                    })}
                  </div>
                  <div className={styles.value}>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.AFF59B24',
                      defaultMessage: '展示所有作业创建记录',
                    })}
                  </div>
                </>
              }
            >
              <span
                style={
                  perspective === Perspective.scheduleView
                    ? { color: 'var(--icon-blue-color)' }
                    : {}
                }
              >
                {formatMessage({
                  id: 'src.component.Schedule.layout.Header.72C38F88',
                  defaultMessage: '作业视角',
                })}
              </span>
            </Tooltip>
          ),
        },

        {
          value: Perspective.executionView,
          icon: (
            <Tooltip
              overlayClassName={styles.filterTooltip}
              title={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.8C48D6AF',
                      defaultMessage: '执行视角',
                    })}
                  </div>
                  <div className={styles.value}>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.A4FB7B38',
                      defaultMessage: '展示所有作业的任务执行记录',
                    })}
                  </div>
                </>
              }
            >
              <span
                style={
                  perspective === Perspective.executionView
                    ? { color: 'var(--icon-blue-color)' }
                    : {}
                }
              >
                {formatMessage({
                  id: 'src.component.Schedule.layout.Header.BAD95B16',
                  defaultMessage: '执行视角',
                })}
              </span>
            </Tooltip>
          ),
        },
      ]}
    />
  );
};

export default Segment;
