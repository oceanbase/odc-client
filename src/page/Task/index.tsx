import PageContainer, { TitleType } from '@/component/PageContainer';

const Task = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: '工单',
        showDivider: true,
      }}
    >
      工单xxx
    </PageContainer>
  );
};

export default Task;
