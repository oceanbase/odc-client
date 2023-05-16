import { switchCurrentOrganization } from '@/common/network/origanization';
import { IOrganization } from '@/d.ts';
import { UserStore } from '@/store/login';
import { TeamOutlined } from '@ant-design/icons';
import { Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { history } from 'umi';
import styles from './index.less';

interface IProps {
  userStore?: UserStore;
}
const SpaceSelectModal: React.FC<IProps> = ({ userStore }) => {
  const visible = true;

  const { user } = userStore;

  const handleGoto = (value: string) => {
    history.push(value);
  };

  const switchOriganization = async (id: number, type: IOrganization['type']) => {
    const isSuccess = await switchCurrentOrganization(id);
    if (isSuccess) {
      type === 'INDIVIDUAL' ? handleGoto('/sqlworkspace') : handleGoto('/project');
    }
  };

  return (
    <Modal
      width={720}
      footer={null}
      closable={false}
      visible={visible}
      wrapClassName={styles['space-modal']}
    >
      <div className={styles.header}>
        <h2>选择你的工作空间</h2>
        <p className={styles.desc}>可在个人设置中切换，此处的选择不影响正常使用</p>
      </div>
      <div className={styles.footer}>
        {user?.belongedToOrganizations.map((ori) => {
          if (ori.type === 'TEAM') {
            return (
              <Space
                className={styles.item}
                direction="vertical"
                size={12}
                onClick={() => switchOriganization(ori.id, ori.type)}
              >
                <div className={styles.synergy}>
                  <TeamOutlined />
                </div>
                <span className={styles.label}>{ori.name}</span>
                <span className={styles.desc}>{ori.description}</span>
              </Space>
            );
          }
          return (
            <Space
              className={styles.item}
              direction="vertical"
              size={12}
              onClick={() => switchOriganization(ori.id, ori.type)}
            >
              <div className={styles.private}>
                <TeamOutlined />
              </div>
              <span className={styles.label}>{ori.name}</span>
              <span className={styles.desc}>{ori.description}</span>
            </Space>
          );
        })}
      </div>
    </Modal>
  );
};

export default inject('userStore')(observer(SpaceSelectModal));
