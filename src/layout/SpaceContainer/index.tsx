/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { UserStore } from '@/store/login';
import { Outlet, useNavigate } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import Sider from './Sider';
import { Alert } from 'antd';
import md5 from 'blueimp-md5';
import setting from '@/store/setting';
import { renderMd } from './helper';

const BannerClosedKey = 'ODC_BannerCloseKey';
interface ISpaceContainerProps {
  userStore: UserStore;
}
const SpaceContainer: React.FC<ISpaceContainerProps> = (props) => {
  const navigate = useNavigate();
  const organizationId = props?.userStore?.organizationId;
  const [id, setId] = useState(organizationId);
  const [bannerVisible, setBannerVisible] = useState(false);
  const homePageText = setting.serverSystemInfo?.homePageText;
  useEffect(() => {
    if (id && organizationId && id !== organizationId) {
      navigate('/project');
    }
    setId(organizationId);
  }, [organizationId]);
  useEffect(() => {
    if (!homePageText) {
      return;
    }
    const lastSign = window.localStorage.getItem(BannerClosedKey);
    const sign = md5(homePageText);
    if (sign !== lastSign) {
      setBannerVisible(true);
    }
  }, [homePageText]);

  const bannerHtml = useMemo(() => {
    if (!homePageText) {
      return '';
    }
    return renderMd(homePageText);
  }, [homePageText]);

  return (
    <div key={id} className={styles.content}>
      {bannerVisible && (
        <div className={styles.alert}>
          <Alert
            onClose={() => {
              window.localStorage.setItem(BannerClosedKey, md5(homePageText));
              setBannerVisible(false);
            }}
            showIcon={false}
            banner
            closable
            message={
              <div
                dangerouslySetInnerHTML={{ __html: bannerHtml }}
                style={{ textAlign: 'center' }}
              ></div>
            }
          />
        </div>
      )}
      <div className={styles.mainBox}>
        <Sider />
        <div className={styles.main}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default inject('userStore')(observer(SpaceContainer));
