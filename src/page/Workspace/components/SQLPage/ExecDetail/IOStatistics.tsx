import { formatMessage } from '@/util/intl';
import { Card, Statistic, Col, Row } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { ISQLExecuteDetail } from '@/d.ts';
const IOStatistics: React.FC<{
  sqlExecuteDetailToShow: ISQLExecuteDetail;
}> = ({ sqlExecuteDetailToShow }) => {
  return (
    <Card
      title={formatMessage({
        id: 'workspace.window.sql.explain.tab.detail.card.io.title',
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
      className={classNames([styles.card, styles.ioCard])}
    >
      <Row>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.rpcCount',
            })}
            value={sqlExecuteDetailToShow?.rpcCount}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.physicalRead',
            })}
            value={sqlExecuteDetailToShow?.physicalRead}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={formatMessage({
              id: 'workspace.window.sql.explain.tab.detail.card.io.ssstoreRead',
            })}
            value={sqlExecuteDetailToShow?.ssstoreRead}
            valueStyle={{ fontSize: '24px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default IOStatistics;
