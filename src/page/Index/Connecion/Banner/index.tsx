import { formatMessage } from '@/util/intl';
import { BookOutlined, CloseOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import React from 'react';

import modal from '@/store/modal';
import styles from './index.less';

interface IProps {
  onClose: () => void;
}

const Banner: React.FC<IProps> = function ({ onClose }) {
  return (
    <div className={styles.banner}>
      <Typography.Title level={4}>
        {
          formatMessage({
            id: 'odc.Connecion.Banner.WelcomeToOceanbaseDeveloperCenter',
          }) /*欢迎使用 OceanBase 开发者中心*/
        }
      </Typography.Title>
      <Typography.Paragraph style={{ maxWidth: '60%', color: 'var(--text-color-secondary)' }}>
        {
          formatMessage({
            id: 'odc.Connecion.Banner.OceanbaseDeveloperCenterOceanbaseDeveloper',
          }) /*OceanBase 开发者中心（OceanBase Developer Center，ODC）是为 OceanBase
        量身打造的企业级数据库开发平台，支持连接 OceanBase
        数据库，并提供数据库日常开发操作、WebSQL、SQL 诊断、导入导出等功能。*/
        }
      </Typography.Paragraph>
      <a
        onClick={() => {
          modal.changeVersionModalVisible(true);
        }}
        className={styles.link}
      >
        <Space>
          <BookOutlined />
          {formatMessage({ id: 'odc.Connecion.Banner.Features' }) /*功能介绍*/}
        </Space>
      </a>
      <div onClick={onClose} className={styles.closeBtn}>
        <CloseOutlined />
      </div>
      <img className={styles.img} src={window.publicPath + 'img/Graphic_ODC.png'} />
    </div>
  );
};

export default Banner;
