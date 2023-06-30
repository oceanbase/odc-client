import UserConfigForm from '@/component/UserConfigForm';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, message, Modal, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

interface IProps {
  visible: boolean;
  onCloseModal: () => void;
  settingStore?: SettingStore;
}

interface IState {
  hasEdit: boolean;
}

@inject('settingStore')
@observer
class UserConfig extends React.PureComponent<IProps, IState> {
  public formRef = React.createRef<FormInstance>();

  readonly state = {
    hasEdit: false,
  };

  componentDidMount() {}

  private handlePost = async (data) => {
    const res = await this.props.settingStore.updateUserConfig(data);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.component.LoginMenus.UserConfig.PersonalSettingsSaved',
        }), // 个人设置保存成功
      );
      this.closeModal();
    }
  };

  private handleSave = async () => {
    this.formRef.current
      .validateFields()
      .then((data) => {
        this.handlePost(data);
      })
      .catch((error) => {
        throw new Error(JSON.stringify(error));
      });
  };

  private handleCancel = () => {
    const { hasEdit } = this.state;
    if (hasEdit) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.component.LoginMenus.UserConfig.AreYouSureYouWant',
        }), // 确认取消修改个人配置吗
        centered: true,
        onOk: () => {
          this.formRef.current.resetFields();
          this.closeModal();
        },
      });
    } else {
      this.closeModal();
    }
  };

  private closeModal = () => {
    this.setState({
      hasEdit: false,
    });

    this.props.onCloseModal();
  };

  private handleValueChange = () => {
    this.setState({
      hasEdit: true,
    });
  };

  render() {
    const {
      visible,
      settingStore: { configurations },
    } = this.props;
    return (
      <Drawer
        open={visible}
        width={520}
        title={formatMessage({
          id: 'odc.component.LoginMenus.UserConfig.EditPersonalSettings',
        })} /* 编辑个人设置 */
        className={styles.userConfig}
        footer={
          <Space>
            <Button onClick={this.handleCancel}>
              {
                formatMessage({
                  id: 'odc.component.LoginMenus.UserConfig.Cancel',
                }) /* 取消 */
              }
            </Button>
            <Button onClick={this.handleSave} type="primary">
              {
                formatMessage({
                  id: 'odc.component.LoginMenus.UserConfig.Save',
                }) /* 保存 */
              }
            </Button>
          </Space>
        }
        onClose={this.handleCancel}
      >
        <UserConfigForm
          formRef={this.formRef}
          initialValues={configurations}
          handleValueChange={this.handleValueChange}
        />
      </Drawer>
    );
  }
}

export default UserConfig;
