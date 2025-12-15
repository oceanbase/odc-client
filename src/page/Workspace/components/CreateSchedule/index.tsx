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
import { SchedulePageTextMap } from '@/constant/schedule';
import { SchedulePageType } from '@/d.ts/schedule';
import CreatePage from '@/component/Schedule/modals/Create';
import { CreateSchedulePage } from '@/store/helper/page/pages/create';
import { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import styles from './index.less';
import { SchedulePageMode } from '@/component/Schedule/interface';

export const getTitleByParams = (params: { scheduleType: SchedulePageType; isEdit: boolean }) => {
  const { scheduleType, isEdit } = params;
  let title;
  if (isEdit) {
    title = formatMessage(
      {
        id: 'src.component.Schedule.5E23B919',
        defaultMessage: '编辑{SchedulePageTextMapType}',
      },
      { SchedulePageTextMapType: SchedulePageTextMap[scheduleType] },
    );
  } else {
    title = formatMessage(
      {
        id: 'src.page.Workspace.components.CreateSchedule.284B8E81',
        defaultMessage: '新建{SchedulePageTextMapScheduleType}',
      },
      { SchedulePageTextMapScheduleType: SchedulePageTextMap[scheduleType] },
    );
  }
  return title;
};

interface IProps {
  pageKey: string;
  sessionManagerStore?: SessionManagerStore;
  modalStore?: ModalStore;
  params: CreateSchedulePage['pageParams'];
}
const CreateSchedule: React.FC<IProps> = (props) => {
  const { params } = props;
  return (
    <div className={styles.CreatePageContainer}>
      <CreatePage type={params.scheduleType} mode={SchedulePageMode.MULTI_PAGE} />
    </div>
  );
};

export default CreateSchedule;
