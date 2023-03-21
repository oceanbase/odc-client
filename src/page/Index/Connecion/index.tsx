import React, { useEffect, useState } from 'react';
import Banner from './Banner';
import ConnectionList from './ConnectionList';

import styles from './index.less';

interface IProps {}

const itemKey = 'odc_banner_invisible';

const Connection: React.FC<IProps> = function () {
  const [bannerVisible, setBannerVisible] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem(itemKey);
    if (value !== 'yes') {
      setBannerVisible(true);
    }
  }, []);
  return (
    <div className={styles.connection}>
      {bannerVisible && (
        <div style={{ padding: '24px 24px 0px 24px' }}>
          <Banner
            onClose={() => {
              setBannerVisible(false);
              localStorage.setItem(itemKey, 'yes');
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, marginTop: 12 }}>
        <ConnectionList />
      </div>
    </div>
  );
};

export default Connection;
