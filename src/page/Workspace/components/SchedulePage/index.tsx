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
import { SchedulePageType } from '@/d.ts/schedule';
import { SchedulePageTextMap } from '@/constant/schedule';
import styles from './index.less';
import Content from '@/component/Schedule/layout/Content';
import { SchedulePageMode } from '@/component/Schedule/interface';

export const getScheduleTitleByParams = (params: { type: SchedulePageType }) => {
  const { type } = params;
  let title = '';
  switch (type) {
    case SchedulePageType.ALL: {
      title = formatMessage({
        id: 'src.page.Workspace.components.SchedulePage.ED5F12A4',
        defaultMessage: '作业-所有作业',
      });
      break;
    }
    default: {
      title = formatMessage(
        {
          id: 'src.page.Workspace.components.SchedulePage.25AC61E5',
          defaultMessage: '作业-{SchedulePageTextMapType}',
        },
        { SchedulePageTextMapType: SchedulePageTextMap[type] },
      );
      break;
    }
  }
  return title;
};

interface IProps {
  pageKey: SchedulePageType;
}

const SchedulePage: React.FC<IProps> = ({ pageKey }) => {
  return (
    <div className={styles.schedule}>
      <Content pageKey={pageKey} mode={SchedulePageMode.MULTI_PAGE} />
    </div>
  );
};

export default SchedulePage;
