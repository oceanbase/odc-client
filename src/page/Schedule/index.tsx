import { formatMessage } from '@/util/intl';
import PageContainer, { TitleType } from '@/component/PageContainer';
import ScheduleManage from '@/component/Schedule';

const Schedule = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'src.page.Schedule.C94DD38F', defaultMessage: '作业' }),
        showDivider: true,
      }}
    >
      <ScheduleManage />
    </PageContainer>
  );
};

export default Schedule;
