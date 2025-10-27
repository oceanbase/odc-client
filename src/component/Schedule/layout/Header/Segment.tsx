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
      className={styles.segmented}
      options={[
        {
          value: Perspective.scheduleView,
          icon: (
            <Tooltip
              title={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.07E87B79',
                      defaultMessage: '作业视角',
                    })}
                  </div>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.AFF59B24',
                      defaultMessage: '展示所有作业创建记录',
                    })}
                  </div>
                </>
              }
            >
              {formatMessage({
                id: 'src.component.Schedule.layout.Header.72C38F88',
                defaultMessage: '作业视角',
              })}
            </Tooltip>
          ),
        },

        {
          value: Perspective.executionView,
          icon: (
            <Tooltip
              title={
                <>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.8C48D6AF',
                      defaultMessage: '执行视角',
                    })}
                  </div>
                  <div>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.A4FB7B38',
                      defaultMessage: '展示所有作业的任务执行记录',
                    })}
                  </div>
                </>
              }
            >
              {formatMessage({
                id: 'src.component.Schedule.layout.Header.BAD95B16',
                defaultMessage: '执行视角',
              })}
            </Tooltip>
          ),
        },
      ]}
    />
  );
};

export default Segment;
