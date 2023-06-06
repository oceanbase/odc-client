import { Input } from 'antd';
import styles from './index.less';

export default function ScriptFile() {
  return (
    <div className={styles.script}>
      <div className={styles.search}>
        <Input.Search placeholder="搜索脚本" size="small" />
      </div>
      <div className={styles.list}>1</div>
    </div>
  );
}
