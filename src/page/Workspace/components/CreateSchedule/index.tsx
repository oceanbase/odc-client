import { SchedulePageTextMap } from '@/constant/schedule';
import { SchedulePageType } from '@/d.ts/schedule';
import CreatePage from '@/component/Schedule/modals/Create';
import { CreateSchedulePage } from '@/store/helper/page/pages/create';
import { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import styles from './index.less';
import { SchedulePageMode } from '@/component/Schedule/interface';

export const getTitleByParams = (params: { scheduleType: SchedulePageType }) => {
  const { scheduleType } = params;
  let title = `新建${SchedulePageTextMap[scheduleType]}`;
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
