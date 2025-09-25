import React, { useEffect } from 'react';
import type { PageStore } from '@/store/page';
import { ScheduleStore } from '@/store/schedule';
import { inject, observer } from 'mobx-react';
import { SchedulePageType } from '@/d.ts/schedule';
import { openSchedulesPage } from '@/store/helper/page';
import { schedlueConfig } from '@/page/Schedule/const';
import styles from '@/component/Schedule/index.less';
import classNames from 'classnames';
import { Tooltip, Typography } from 'antd';
import { SchedulePageMode } from '../interface';
import { getFirstEnabledSchedule } from '../helper';
const { Text } = Typography;

interface IProps {
  scheduleStore?: ScheduleStore;
  pageStore?: PageStore;
  className?: string;
  mode: SchedulePageMode;
}
const Sider: React.FC<IProps> = (props) => {
  const { scheduleStore, pageStore, className, mode } = props;
  const pageKey =
    mode === SchedulePageMode.MULTI_PAGE
      ? pageStore?.activePageKey
      : scheduleStore.schedulePageType;

  const handleClick = (value: SchedulePageType) => {
    if (mode === SchedulePageMode.MULTI_PAGE) {
      openSchedulesPage(value);
    }
    scheduleStore.setSchedulePageType(value);
    scheduleStore.setSelectedRowKeys([]);
  };

  useEffect(() => {
    if (!scheduleStore.schedulePageType) {
      scheduleStore.setSchedulePageType(getFirstEnabledSchedule()?.pageType);
    }
  }, []);

  return (
    <div className={`${styles.schedlueSider} ${className}`}>
      {Object.values(schedlueConfig).map((item) => {
        if (!item.enabled()) return;
        return (
          <div
            key={item.pageType}
            className={classNames(
              {
                [styles.selected]: pageKey === item.pageType,
              },
              styles.groupItem,
            )}
            onClick={() => handleClick(item.pageType)}
          >
            <Tooltip title={item.label} placement="right">
              <Text ellipsis>{item.label}</Text>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default inject('scheduleStore', 'pageStore')(observer(Sider));
