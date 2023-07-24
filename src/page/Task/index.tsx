import PageContainer, { TitleType } from '@/component/PageContainer';
import TaskManage from '@/component/Task';
import { formatMessage } from '@/util/intl';

const Task = () => {
  return (
    <PageContainer
      titleProps={{
        type: TitleType.TEXT,
        title: formatMessage({ id: 'odc.page.Task.Ticket' }), //工单
        showDivider: true,
      }}
    >
      <TaskManage />
    </PageContainer>
  );
};

export default Task;
