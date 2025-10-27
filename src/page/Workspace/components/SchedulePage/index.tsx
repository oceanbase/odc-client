import { formatMessage } from '@/util/intl';
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
      title = formatMessage({
        id: 'src.page.Workspace.components.SchedulePage.ED5F12A4',
        defaultMessage: '作业-所有作业',
      });
      break;
    }
    default: {
      title = formatMessage(
        {
          id: 'src.page.Workspace.components.SchedulePage.25AC61E5',
          defaultMessage: '作业-{SchedulePageTextMapType}',
        },
        { SchedulePageTextMapType: SchedulePageTextMap[type] },
      );
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
