import { Space, Timeline } from 'antd';
import Icon from '@ant-design/icons';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import RiskLevelLabel from '@/component/RiskLevelLabel';

import styles from './index.less';
import { IConnection } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';

const ShowTemplate: React.FC<{
  orderedDatabaseIds: number[][];
  databaseIdsMap: {
    [key in number]: {
      name: string;
      dataSource: IConnection;
      environment: IEnvironment;
    };
  };
}> = ({ orderedDatabaseIds, databaseIdsMap }) => {
  return (
    <Timeline mode="left">
      {orderedDatabaseIds?.map((dbs, index) => (
        <Timeline.Item className={styles.timelineItem} key={index}>
          <div>{`执行节点${index + 1}`}</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#F7F9FB',
              padding: '12px 16px',
              marginTop: '8px',
            }}
          >
            {dbs?.map((db, _index) => {
              const icon = getDataSourceStyleByConnectType(databaseIdsMap?.[db]?.dataSource?.type);
              return (
                <Space key={_index} size={0}>
                  <RiskLevelLabel
                    content={databaseIdsMap?.[db]?.environment?.name}
                    color={databaseIdsMap?.[db]?.environment?.style}
                  />
                  <Space size={4}>
                    <Icon
                      component={icon?.icon?.component}
                      style={{
                        color: icon?.icon?.color,
                        fontSize: 16,
                        marginRight: 4,
                      }}
                    />
                    <div>{databaseIdsMap?.[db]?.name}</div>
                    <div style={{ color: 'var(--neutral-black45-color)' }}>
                      {databaseIdsMap?.[db]?.dataSource?.name}
                    </div>
                  </Space>
                </Space>
              );
            })}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};
export default ShowTemplate;
