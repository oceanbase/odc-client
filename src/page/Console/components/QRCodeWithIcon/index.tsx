import React from 'react';
import { QRCode } from 'antd';
import { ReactComponent as DingSvg } from '@/svgr/dingding.svg';
import styles from './index.less';
import { ConsoleTextConfig } from '../../const';

const QrCodeWithIcon = () => {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <DingSvg className={styles.circleIcon} />
      </div>
      <div className={styles.qrCodeContainer}>
        <QRCode
          value={ConsoleTextConfig.aboutUs.QRUrl}
          size={80}
          style={{ padding: 0, margin: 0 }}
        />
      </div>
    </div>
  );
};

export default QrCodeWithIcon;
