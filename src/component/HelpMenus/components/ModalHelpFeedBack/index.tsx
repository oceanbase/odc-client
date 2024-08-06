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

import { SettingStore } from '@/store/setting';
import { ReactComponent as GithubSvg } from '@/svgr/github.svg';
import { ReactComponent as ODCColorSvg } from '@/svgr/odc_logo_color.svg';
import ipcInvoke from '@/util/client/service';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Image, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import { PureComponent } from 'react';
import styles from './index.less';

import Icon from '@ant-design/icons';
import pkg from '../../../../../package.json';

@inject('settingStore')
@observer
export default class ModalHelp extends PureComponent<{
  showModal: boolean;
  settingStore?: SettingStore;
  onCancel: () => void;
}> {
  public render() {
    const { settingStore } = this.props;
    const serverSystemInfo = settingStore.serverSystemInfo;
    const feekBackUrl = serverSystemInfo?.supportGroupQRCodeUrl;
    return (
      <Modal
        className={styles.modalFeedback}
        title=""
        centered
        open={this.props.showModal}
        onCancel={this.props.onCancel}
        footer={null}
      >
        <h3>
          {formatMessage({
            id: 'odc.components.ModalHelpFeedBack.Feedback',
            defaultMessage: '意见反馈',
          })}
        </h3>
        {feekBackUrl ? <Image width={240} height={240} src={feekBackUrl} /> : null}
        <div className="email">
          <h4>
            <Icon style={{ fontSize: 14, marginRight: 8 }} component={ODCColorSvg} />
            {formatMessage({
              id: 'odc.components.ModalHelpFeedBack.SupportedEmailAddresses',
              defaultMessage: '支持邮箱',
            })}
          </h4>
          <p>{serverSystemInfo?.supportEmail || pkg.bugs.email}</p>
          <h4>
            <Icon style={{ fontSize: 14, marginRight: 8 }} component={GithubSvg} />
            {'Github issues'}
          </h4>
          <a href="https://github.com/oceanbase/odc/issues">
            {'https://github.com/oceanbase/odc/issues'}
          </a>
          {serverSystemInfo?.supportUrl ? <p>Help: {serverSystemInfo?.supportUrl}</p> : null}
        </div>
        {isClient() ? (
          <a
            onClick={async () => {
              ipcInvoke('feedback');
            }}
          >
            Generate information package
          </a>
        ) : null}
      </Modal>
    );
  }
}
