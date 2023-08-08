import RiskLevelLabel from '@/component/RiskLevelLabel';
import { formatMessage } from '@/util/intl';
import { Descriptions, Space } from 'antd';
import styles from './index.less';

const EnvironmentInfo = ({ label, style, description }) => {
  return (
    <>
      <Space className={styles.tag}>
        <div className={styles.tagLabel}>
          {formatMessage({ id: 'odc.Env.components.InnerEnvironment.LabelStyle' }) /*标签样式:*/}
        </div>
        <RiskLevelLabel content={label} color={style} />
      </Space>
      <Descriptions column={1}>
        <Descriptions.Item
          contentStyle={{ whiteSpace: 'pre' }}
          label={
            formatMessage({ id: 'odc.Env.components.InnerEnvironment.Description' }) //描述
          }
        >
          {description}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
export default EnvironmentInfo;
