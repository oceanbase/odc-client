/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatMessage } from '@/util/intl';
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
import { useContext, useEffect } from 'react';
import tracert from '@/util/tracert';

export default function DefaultPage() {
  useEffect(() => {
    tracert.expo('a3112.b41896.c330987');
  }, []);
  const context = useContext(ActivityBarContext);
  return (
    <div style={{ marginLeft: '50%', marginTop: 100, transform: 'translateX(-50%)', width: 360 }}>
      <Typography.Title level={4}>
        {formatMessage({ id: 'odc.component.WindowManager.DefaultPage.QuickStart' }) /*快速开始*/}
      </Typography.Title>
      <div
        onClick={() => {
          openNewSQLPage(null, 'datasource');
          tracert.click('a3112.b41896.c330987.d367617');
        }}
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={ConsoleSQLSvg} />
        </div>
        <div className={styles.label}>
          {
            formatMessage({
              id: 'odc.component.WindowManager.DefaultPage.OpenTheSqlWindow',
            }) /*打开 SQL 窗口*/
          }
        </div>
      </div>
      <div
        onClick={() => {
          tracert.click('a3112.b41896.c330987.d367618');
          openNewDefaultPLPage(null, null, null, 'datasource');
        }}
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={ConsolePLSvg} />
        </div>
        <div className={styles.label}>
          {
            formatMessage({
              id: 'odc.component.WindowManager.DefaultPage.OpenTheAnonymousBlockWindow',
            }) /*打开匿名块窗口*/
          }
        </div>
      </div>
      <div
        onClick={() => {
          tracert.click('a3112.b41896.c330987.d367619');
          context?.setActiveKey(ActivityBarItemType.Task);
        }}
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={TaskSvg} />
        </div>
        <div className={styles.label}>
          {
            formatMessage({
              id: 'odc.component.WindowManager.DefaultPage.ViewTickets',
            }) /*查看工单*/
          }
        </div>
      </div>
      <div
        onClick={() => {
          tracert.click('a3112.b41896.c330987.d367620');
          setting.setTheme(setting.theme?.key === 'odc-white' ? 'odc-dark' : 'odc-white');
        }}
        className={styles.item}
      >
        <div className={styles.icon}>
          <Icon component={FormatPainterFilled} />
        </div>
        <div className={styles.label}>
          {
            formatMessage({
              id: 'odc.component.WindowManager.DefaultPage.SwitchTopics',
            }) /*切换主题*/
          }
        </div>
      </div>
    </div>
  );
}
