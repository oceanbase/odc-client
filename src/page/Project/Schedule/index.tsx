import ScheduleManage from '@/component/Schedule';
import { SchedulePageMode } from '@/component/Schedule/interface';

interface IProps {
  id: string;
}
const Schedule: React.FC<IProps> = ({ id }) => {
  return <ScheduleManage projectId={Number(id)} mode={SchedulePageMode.PROJECT} />;
};
export default Schedule;
