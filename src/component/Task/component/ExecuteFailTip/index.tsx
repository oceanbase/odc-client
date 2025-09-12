import { formatMessage } from '@/util/intl';
import { Alert } from 'antd';

export default function ExecuteFailTip() {
  return (
    <Alert
      message={
        '周期执行期间若数据库连接失败或项目不存在，可能导致任务执行失败。 30 天内连续调度失败, 任务将自动终止。'
      }
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
}
