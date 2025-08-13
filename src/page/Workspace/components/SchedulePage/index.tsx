import { SchedulePageType } from '@/d.ts/schedule';
import { SchedulePageTextMap } from '@/constant/schedule';
import styles from './index.less';
import Content from '@/component/Schedule/layout/Content';
import { SchedulePageMode } from '@/component/Schedule/interface';

export const getScheduleTitleByParams = (params: { type: SchedulePageType }) => {
  const { type } = params;
  let title = '';
  switch (type) {
    case SchedulePageType.ALL: {
      title = '作业-所有作业';
      break;
    }
    default: {
      title = `作业-${SchedulePageTextMap[type]}`;
      break;
    }
  }
  return title;
};

interface IProps {
  pageKey: SchedulePageType;
}

const SchedulePage: React.FC<IProps> = ({ pageKey }) => {
  return (
    <div className={styles.schedule}>
      <Content pageKey={pageKey} mode={SchedulePageMode.MULTI_PAGE} />
    </div>
  );
};

export default SchedulePage;
