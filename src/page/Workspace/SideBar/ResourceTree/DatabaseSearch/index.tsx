import { formatMessage } from '@/util/intl';
import { Input } from 'antd';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';

interface IProps {
  modalStore?: ModalStore;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  searchValue: string;
}

const DatabaseSearch: React.FC<IProps> = (props) => {
  const { modalStore, setSearchValue, searchValue } = props;
  return (
    <Input.Search
      style={{
        width: '100%',
        height: '28px',
      }}
      placeholder={formatMessage({
        id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseSearch.86200ED0',
        defaultMessage: '搜索',
      })}
      onChange={(e) => {
        setSearchValue(e.target.value);
      }}
      onSearch={() => {
        modalStore.changeDatabaseSearchModalVisible(true, {
          initStatus: SearchStatus.defalut,
          initSearchKey: searchValue,
        });
      }}
    />
  );
};

export default inject('modalStore')(observer(DatabaseSearch));
