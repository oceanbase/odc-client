import React from 'react';
import { Popover, QRCode } from 'antd';
import { ReactComponent as DingSvg } from '@/svgr/dingding.svg';
import styles from './index.less';
import { ConsoleTextConfig } from '../../const';
interface IProps {
  size?: number;
  padding?: number;
}

const QrCodeWithIcon = ({ size = 75 }: IProps) => {
  const renderContent = (qrSize: number, padding: number, iconClassName: string) => (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <DingSvg className={iconClassName} />
      </div>
      <div className={styles.qrCodeContainer}>
        <QRCode
          value={ConsoleTextConfig.aboutUs.QRUrl}
          size={qrSize}
          className={styles.qrCode}
          style={{ padding }}
          color="#132039"
        />
      </div>
    </div>
  );

  return (
    <Popover placement="left" content={renderContent(160, 0, styles.circleIconPopover)}>
      {renderContent(size, 5, styles.circleIcon)}
    </Popover>
  );
};

export default QrCodeWithIcon;
