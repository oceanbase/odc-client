import { ReactComponent as NoDataSVG } from '@/svgr/noData.svg';
import styles from './index.less';
import Icon from '@ant-design/icons';
import { Typography } from 'antd';

const LargeModelSelectEmpty = () => {
  return (
    <div className={styles.largeModelSelectEmpty}>
      <Icon className={styles.icon} component={NoDataSVG} />
      <Typography.Text type="secondary">暂无可用模型，请先配置模型供应商</Typography.Text>
    </div>
  );
};

export default LargeModelSelectEmpty;
