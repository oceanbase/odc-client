/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
          initStatus: SearchStatus.forDatabase,
          initSearchKey: searchValue,
        });
      }}
    />
  );
};

export default inject('modalStore', 'settingStore')(observer(DatabaseSearch));
