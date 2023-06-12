import { Typography } from 'antd';

import Icon, { FormatPainterFilled } from '@ant-design/icons';

import styles from './DefaultPage.less';

import ConsoleSQLSvg from '@/svgr/Console-SQL.svg';
import TaskSvg from '@/svgr/icon_task.svg';

import { ActivityBarItemType } from '@/page/Workspace/ActivityBar/type';
import ActivityBarContext from '@/page/Workspace/context/ActivityBarContext';
import { openNewDefaultPLPage, openNewSQLPage } from '@/store/helper/page';
import setting from '@/store/setting';
import ConsolePLSvg from '@/svgr/Console-PL.svg';
import { useContext } from 'react';

export default function DefaultPage() {
  const context = useContext(ActivityBarContext);
  return (
    <div style={{ marginLeft: '50%', marginTop: 100, transform: 'translateX(-50%)', width: 360 }}>
      <Typography.Title level={4}>快速开始</Typography.Title>
      <div onClick={() => openNewSQLPage(null, null, 'datasource')} className={styles.item}>
        <div className={styles.icon}>
          <Icon component={ConsoleSQLSvg} />
        </div>
        <div className={styles.label}>打开 SQL 窗口</div>
      </div>
      <div
        onClick={() => openNewDefaultPLPage(null, null, null, 'datasource')}
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={ConsolePLSvg} />
        </div>
        <div className={styles.label}>打开匿名块窗口</div>
      </div>
      <div onClick={() => context?.setActiveKey(ActivityBarItemType.Job)} className={styles.item}>
        <div className={styles.icon}>
          <Icon component={TaskSvg} />
        </div>
        <div className={styles.label}>查看工单</div>
      </div>
      <div
        onClick={() =>
          setting.setTheme(setting.theme?.key === 'odc-white' ? 'odc-dark' : 'odc-white')
        }
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={FormatPainterFilled} />
        </div>
        <div className={styles.label}>切换主题</div>
      </div>
    </div>
  );
}
