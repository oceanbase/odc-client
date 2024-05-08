import { formatMessage } from '@/util/intl';
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

import ODCSetting from '@/component/ODCSetting';
import modal from '@/store/modal';
import { SettingOutlined } from '@ant-design/icons';
import React from 'react';
import MenuItem from '../MenuItem';

interface IProps {
  collapsed?: boolean;
}

const SettingItem: React.FC<IProps> = function ({ collapsed }) {
  return (
    <>
      <MenuItem
        onClick={() => {
          modal.changeOdcSettingVisible(true);
        }}
        icon={SettingOutlined}
        collapsed={collapsed}
        label={formatMessage({ id: 'src.layout.SpaceContainer.Sider.SettingItem.CBBE0F8B' })}
      />

      <ODCSetting />
    </>
  );
};

export default SettingItem;
