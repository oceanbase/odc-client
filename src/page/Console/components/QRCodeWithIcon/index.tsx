import React from 'react';
import { Popover, QRCode } from 'antd';
import { ReactComponent as DingSvg } from '@/svgr/dingding.svg';
import styles from './index.less';
import { ConsoleTextConfig } from '../../const';
interface IProps {
  size?: number;
}

const QrCodeWithIcon = ({ size = 80 }: IProps) => {
  const renderContent = (qrSize: number, iconClassName: string) => (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <DingSvg className={iconClassName} />
      </div>
      <div className={styles.qrCodeContainer}>
        <QRCode
          value={ConsoleTextConfig.aboutUs.QRUrl}
          size={qrSize}
          style={{ padding: 0, margin: 0 }}
        />
      </div>
    </div>
  );

  return (
    <Popover placement="left" content={renderContent(160, styles.circleIconPopover)}>
      {renderContent(size, styles.circleIcon)}
    </Popover>
  );
};

export default QrCodeWithIcon;
