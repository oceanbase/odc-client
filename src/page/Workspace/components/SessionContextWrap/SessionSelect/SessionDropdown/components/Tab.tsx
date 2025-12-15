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
