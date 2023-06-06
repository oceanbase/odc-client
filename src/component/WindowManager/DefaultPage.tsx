import { Typography } from 'antd';

import Icon, { FormatPainterFilled } from '@ant-design/icons';

import styles from './DefaultPage.less';

import ConsoleSQLSvg from '@/svgr/Console-SQL.svg';
import TaskSvg from '@/svgr/icon_task.svg';

import ConsolePLSvg from '@/svgr/Console-PL.svg';

export default function DefaultPage() {
  return (
    <div style={{ marginLeft: '50%', marginTop: 100, transform: 'translateX(-50%)', width: 360 }}>
      <Typography.Title level={4}>快速开始</Typography.Title>
      <div className={styles.item}>
        <div className={styles.icon}>
          <Icon component={ConsoleSQLSvg} />
        </div>
        <div className={styles.label}>打开 SQL 窗口</div>
      </div>
      <div className={styles.item}>
        <div className={styles.icon}>
          <Icon component={ConsolePLSvg} />
        </div>
        <div className={styles.label}>打开匿名块窗口</div>
      </div>
      <div className={styles.item}>
        <div className={styles.icon}>
          <Icon component={TaskSvg} />
        </div>
        <div className={styles.label}>查看工单</div>
      </div>
      <div className={styles.item}>
        <div className={styles.icon}>
          <Icon component={FormatPainterFilled} />
        </div>
        <div className={styles.label}>切换主题</div>
      </div>
    </div>
  );
}
