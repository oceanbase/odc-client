import PageContainer, { TitleType } from '@/component/PageContainer';
import ScheduleManage from '@/component/Schedule';

const Schedule = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '作业',
        showDivider: true,
      }}
    >
      <ScheduleManage />
    </PageContainer>
  );
};

export default Schedule;
