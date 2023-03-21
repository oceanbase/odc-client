import { getSystemConfig, setSystemConfig } from '@/common/network/manager';
import { Acess, systemUpdatePermissions } from '@/component/Acess';
import UserConfigForm from '@/component/UserConfigForm';
import type { IUserConfig } from '@/d.ts';
import { IManagerResourceType } from '@/d.ts';
import type { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { Button, Divider, message, Modal, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React from 'react';
import SystemConfigDetail from './components';
import styles from './index.less';

interface IProps {
  visible: boolean;
  userStore?: UserStore;
}

interface IState {
  hasEdit: boolean;
  isEdit: boolean;
  config: IUserConfig;
}

@inject('userStore')
@observer
class SystemConfigPage extends React.PureComponent<IProps, IState> {
  public formRef = React.createRef<FormInstance>();

  readonly state = {
    hasEdit: false,
    isEdit: false,
    config: {} as IUserConfig,
  };

  componentDidMount() {
    this.loadSystemConfig();
  }

  private loadSystemConfig = async () => {
    const res = await getSystemConfig();
    if (res) {
      this.setState({
        config: res,
      });
    }
  };

  private handlePost = async (data) => {
    const serverData = Object.keys(data).map((key) => {
      return {
        key,
        value: data[key],
      };
    });
    const res = await setSystemConfig(serverData);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.SystemConfigPage.SystemSettingsSaved',
        }),
        // 系统设置保存成功
      );
      this.loadSystemConfig();
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
        }),

        // 确认取消修改个人配置吗
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
      isEdit: false,
    });
  };

  private handleValueChange = () => {
    this.setState({
      hasEdit: true,
    });
  };

  render() {
    const { isEdit, config } = this.state;
    return (
      <div className={styles.systemConfig}>
        <div className={styles.header}>
          <div className={styles.title}>
            {
              formatMessage({
                id: 'odc.components.SystemConfigPage.SystemSettings',
              }) /* 系统设置 */
            }
          </div>
          {!isEdit && (
            <Acess {...systemUpdatePermissions[IManagerResourceType.system_config]}>
              <Button
                type="primary"
                onClick={() => {
                  this.setState({
                    isEdit: true,
                  });
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.SystemConfigPage.Editing',
                  })
                  /* 编辑 */
                }
              </Button>
            </Acess>
          )}
        </div>
        <Divider />
        {!isEdit ? (
          <SystemConfigDetail {...config} />
        ) : (
          <>
            <UserConfigForm
              formRef={this.formRef}
              initialValues={config}
              handleValueChange={this.handleValueChange}
            />

            <Space className={styles.footer}>
              <Button onClick={this.handleSave} type="primary">
                {
                  formatMessage({
                    id: 'odc.component.LoginMenus.UserConfig.Save',
                  })

                  /* 保存 */
                }
              </Button>
              <Button onClick={this.handleCancel}>
                {
                  formatMessage({
                    id: 'odc.component.LoginMenus.UserConfig.Cancel',
                  })

                  /* 取消 */
                }
              </Button>
            </Space>
          </>
        )}
      </div>
    );
  }
}

export default SystemConfigPage;
