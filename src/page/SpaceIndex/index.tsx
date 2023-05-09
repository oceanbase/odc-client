import { TeamOutlined } from '@ant-design/icons';
import { Modal, Space } from 'antd';
import React from 'react';
import { history } from 'umi';
import styles from './index.less';

interface IProps {}
const SpaceSelectModal: React.FC<IProps> = (props) => {
  const visible = true;

  const handleGoto = (value: string) => {
    history.push(value);
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
        <Space
          className={styles.item}
          direction="vertical"
          size={12}
          onClick={() => handleGoto('/project')}
        >
          <div className={styles.synergy}>
            <TeamOutlined />
          </div>
          <span className={styles.label}>团队空间</span>
          <span className={styles.desc}>
            支持多个项目和成员，提供统一管控规则，保障团队的高效协同和数据源安全变更
          </span>
        </Space>
        <Space
          className={styles.item}
          direction="vertical"
          size={12}
          onClick={() => handleGoto('/sqlworkspace')}
        >
          <div className={styles.private}>
            <TeamOutlined />
          </div>
          <span className={styles.label}>个人空间</span>
          <span className={styles.desc}>无需配置复杂的管控规则，自由管理个人数据源，灵活变更</span>
        </Space>
      </div>
    </Modal>
  );
};

export default SpaceSelectModal;
