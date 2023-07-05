import PageContainer, { TitleType } from '@/component/PageContainer';
import TaskManage from '@/component/Task';

const Task = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '工单',
        showDivider: true,
      }}
    >
      <TaskManage />
    </PageContainer>
  );
};

export default Task;
