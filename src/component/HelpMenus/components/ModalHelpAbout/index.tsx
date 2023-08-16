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

import { formatMessage, getLocalImg } from '@/util/intl';
import { Modal, Space } from 'antd';
import moment from 'moment';
import { PureComponent } from 'react';
import { GithubFilled } from '@ant-design/icons';
import pkg from '../../../../../package.json';
import styles from './index.less';
import setting from '@/store/setting';
console.log(RELEASE_DATE);
export default class ModalHelp extends PureComponent<{
  showModal: boolean;
  onCancel: () => void;
}> {
  public render() {
    return (
      <Modal
        className={styles.modalAbout}
        title=""
        open={this.props.showModal}
        onCancel={this.props.onCancel}
        footer={null}
        width={480}
        centered
      >
        <div className="basic-info">
          <img className="logo" src={getLocalImg('version_icon.png')} />
        </div>
        <div className="release-version">
          <p>
            {formatMessage(
              {
                id: 'odc.components.ModalHelpAbout.VersionNumberPkgversion',
              },
              { pkgVersion: pkg.version },
            )}
          </p>
          <span>Server: {setting?.serverSystemInfo?.version}</span>
          <br />
          <span>Release Date: {RELEASE_DATE ? moment(RELEASE_DATE).format('y-MM-DD') : ''}</span>
        </div>
        <div className={styles.copyright}>
          <div>
            <a target="_blank" href={pkg.homepage} rel="noreferrer">
              {pkg.homepage}
            </a>
            <div className="grey-color">{pkg.copyright}</div>
          </div>
          <Space size={18}>
            <img style={{ height: 16 }} src={window.publicPath + 'img/ob_logo.svg'} />
            <a href="https://github.com/oceanbase/odc" className={styles.github} target="_blank">
              <GithubFilled />
            </a>
          </Space>
        </div>
      </Modal>
    );
  }
}
