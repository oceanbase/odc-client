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
