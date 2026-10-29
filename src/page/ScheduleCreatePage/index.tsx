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
import CreatePage from '@/component/Schedule/modals/Create';
import PageContainer, { TitleType } from '@/component/PageContainer';
import useURLParams from '@/util/hooks/useUrlParams';
import { ScheduleType } from '@/d.ts/schedule';
import { useEffect, useMemo, useState } from 'react';
import { SchedulePageTextMap } from '@/constant/schedule';
import { LeftOutlined } from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import { ScheduleStore } from '@/store/schedule';
import { SchedulePageMode } from '@/component/Schedule/interface';

interface IProps {
  scheduleStore?: ScheduleStore;
}
const ScheduleCreatePage: React.FC<IProps> = ({ scheduleStore }) => {
  const { getParam } = useURLParams();
  const type = getParam('type') as ScheduleType;
  const [title, setTitle] = useState(SchedulePageTextMap[ScheduleType.DATA_ARCHIVE]);
  const isEdit = getParam('isEdit');
  const location = useLocation();

  const mode = useMemo(() => {
    return location.pathname.includes('project')
      ? SchedulePageMode.PROJECT
      : SchedulePageMode.COMMON;
  }, [location.pathname]);

  useEffect(() => {
    if (type && Object.values(ScheduleType).includes(type)) {
      setTitle(SchedulePageTextMap[type]);
    }
  }, [type]);

  return (
    <PageContainer
      containerWrapStyle={{ padding: '12px 0px' }}
      titleProps={{
        type: TitleType.TEXT,
        title: (
          <>
            <LeftOutlined
              style={{ marginRight: '6px' }}
              onClick={() => {
                history?.back();
                scheduleStore.resetScheduleCreateData();
              }}
            />

            {isEdit
              ? formatMessage({
                  id: 'src.page.ScheduleCreatePage.1E232A3B',
                  defaultMessage: '编辑',
                }) +
                title +
                formatMessage({
                  id: 'src.page.ScheduleCreatePage.A0C6CB63',
                  defaultMessage: '作业',
                })
              : formatMessage({
                  id: 'src.page.ScheduleCreatePage.74066CF4',
                  defaultMessage: '新建',
                }) +
                title +
                formatMessage({
                  id: 'src.page.ScheduleCreatePage.94CAAB53',
                  defaultMessage: '作业',
                })}
          </>
        ),

        showDivider: true,
      }}
    >
      <CreatePage mode={mode} />
    </PageContainer>
  );
};

export default inject('scheduleStore')(observer(ScheduleCreatePage));
