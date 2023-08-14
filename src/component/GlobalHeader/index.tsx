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

import HelpMenus from '@/component/HelpMenus';
import LocalMenus from '@/component/LocalMenus';
import LoginMenus from '@/component/LoginMenus';
import RecordPopover from '@/component/RecordPopover';
import TaskPopover from '@/component/TaskPopover';
import odc from '@/plugins/odc';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import ODCBlackSvg from '@/svgr/odc_black.svg';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { PureComponent } from 'react';
import HeaderBtn from '../HeaderBtn';
import UserConfig from '../LoginMenus/UserConfig';
import ThemeBtn from '../ThemeBtn';
import styles from './index.less';

@inject('userStore', 'settingStore', 'modalStore')
@observer
export default class GlobalHeader extends PureComponent<{
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
}> {
  public render() {
    return (
      <div className={styles.header}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>
            <Icon component={ODCBlackSvg} className={styles.buttonIcon} />
            <span className={styles.title}>
              {
                this.props.settingStore?.serverSystemInfo?.odcTitle ||
                  formatMessage({
                    id: 'odc.component.GlobalHeader.OceanbaseDeveloperCenter',
                  }) //OceanBase 开发者中心
              }
            </span>
          </div>
        </div>
        <div className={styles.rightContent}>
          <TaskPopover showAllSchemaTaskType={true} />
          {this.props.settingStore.enablePersonalRecord ? <RecordPopover /> : null}
          <div className={styles.divider} />
          <HelpMenus />
          <ThemeBtn />
          {odc.appConfig.locale.menu ? <LocalMenus /> : null}
          {odc.appConfig.login.menu ? (
            <>
              <div className={styles.divider} />
              <LoginMenus />
            </>
          ) : (
            <>
              <HeaderBtn
                onClick={() => {
                  this.props.modalStore.changeUserConfigModal(true);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.LoginMenus.PersonalSettings',
                  }) /* 个人设置 */
                }
              </HeaderBtn>
              <UserConfig
                visible={this.props.modalStore.userConfigModalVisible}
                onCloseModal={() => {
                  this.props.modalStore.changeUserConfigModal(false);
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }
}
