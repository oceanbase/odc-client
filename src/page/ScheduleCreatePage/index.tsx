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
            {isEdit ? '编辑' + title + '作业' : '新建' + title + '作业'}
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
