import { formatMessage } from '@/util/intl';
import { TabsType } from '../index';
import { Radio } from 'antd';
import styles from '../index.less';

interface IProps {
  setTab: React.Dispatch<React.SetStateAction<TabsType>>;
  tab: TabsType;
}
const DatabaseSelectTab: React.FC<IProps> = (props) => {
  const { tab, setTab } = props;

  return (
    <Radio.Group
      className={styles.tab}
      value={tab}
      onChange={(e) => {
        setTab(e.target.value as TabsType);
      }}
    >
      <Radio.Button value={TabsType.all}>
        {formatMessage({
          id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.components.D9D77695',
          defaultMessage: '全部',
        })}
      </Radio.Button>
      <Radio.Button value={TabsType.recentlyUsed}>
        {formatMessage({
          id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.SessionDropdown.components.C13AC3B3',
          defaultMessage: '最近',
        })}
      </Radio.Button>
    </Radio.Group>
  );
};

export default DatabaseSelectTab;
