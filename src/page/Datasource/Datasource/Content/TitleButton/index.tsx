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

import { Acess, createPermission } from '@/component/Acess';
import { actionTypes, IManagerResourceType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import NewDatasourceButton from '../../NewDatasourceDrawer/NewButton';

interface IProps {
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  onReload?: () => void;
}
const TitleButton: React.FC<IProps> = function (props) {
  return (
    <>
      <Space>
        <Acess {...createPermission(IManagerResourceType.resource, actionTypes.create)}>
          <NewDatasourceButton
            disableTheme
            onSuccess={() => {
              props.onReload();
            }}
          />
        </Acess>
      </Space>
    </>
  );
};
export default inject('settingStore', 'modalStore')(observer(TitleButton));
