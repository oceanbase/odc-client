import { formatMessage } from '@/util/intl';
import { Input } from 'antd';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { isMac } from '@/util/env';
import { useMemo } from 'react';
import styles from '../index.less';
interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  searchValue: string;
}

const DatabaseSearch: React.FC<IProps> = (props) => {
  const { modalStore, setSearchValue, searchValue, settingStore } = props;

  const getShortcut = useMemo(() => {
    let str = '';
    if (isMac()) {
      str = '⌘ J';
    } else {
      str = 'Ctrl J';
    }
    return <span className={styles.shortCut}>{str}</span>;
  }, []);

  return (
    <Input.Search
      className={styles.searchInput}
      placeholder={formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearch.86200ED0',
        defaultMessage: '搜索',
      })}
      size="small"
      onChange={(e) => {
        setSearchValue(e.target.value);
      }}
      suffix={getShortcut}
      onSearch={() => {
        modalStore.changeDatabaseSearchModalVisible(true, {
          initStatus: SearchStatus.defalut,
          initSearchKey: searchValue,
        });
      }}
    />
  );
};

export default inject('modalStore', 'settingStore')(observer(DatabaseSearch));
