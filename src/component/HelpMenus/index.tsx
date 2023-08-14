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

import DropdownMenu from '@/component/DropdownMenu';
import odc from '@/plugins/odc';
import modal from '@/store/modal';
import { isClient } from '@/util/env';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Menu } from 'antd';
import type { DropDownProps } from 'antd/lib/dropdown';
import classnames from 'classnames';
import React from 'react';
import VersionModal from '../VersionModal';
import ModalHelpAbout from './components/ModalHelpAbout';
import ModalHelpFeedBack from './components/ModalHelpFeedBack';
import styles from './index.less';

export default class HelpMenus extends React.Component<
  {
    size?: 'large' | 'normal';
    placement?: DropDownProps['placement'];
  },
  any
> {
  state = {
    showModalFeedback: false,
    showModalAbout: false,
  };

  iconSize = {
    large: 18,
    normal: 12,
  };

  HELP_MENUS = [
    !isClient() && {
      title: formatMessage({
        id: 'odc.component.HelpMenus.ProductFunctionIntroduction',
      }), // 产品功能介绍
      key: 'versionInfo',
      action() {
        modal.changeVersionModalVisible(true);
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.GlobalHeader.BrowseHelpDocuments',
      }),

      key: 'pdf',
      action() {
        window.open(odc.appConfig.docs.url || getLocalDocs());
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.GlobalHeader.AboutDeveloperCenter',
      }),

      key: 'about',
      action(ctx: HelpMenus) {
        ctx.setState({
          showModalAbout: true,
        });
      },
    },

    {
      title: formatMessage({ id: 'odc.component.GlobalHeader.Feedback' }),
      key: 'feedback',
      action(ctx: HelpMenus) {
        ctx.setState({
          showModalFeedback: true,
        });
      },
    },
  ].filter(Boolean);

  public getHelpMenus = () => {
    return (
      <Menu>
        {this.HELP_MENUS.map((item) => (
          <Menu.Item key={item.key} onClick={this.handleClickHelpMenu}>
            {item.title}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  public handleClickHelpMenu = (item) => {
    const targetMenu = this.HELP_MENUS.find((menu) => menu.key === item.key);
    targetMenu.action(this);
  };

  render() {
    const { showModalAbout, showModalFeedback } = this.state;
    const { size, placement } = this.props;
    return (
      <>
        <DropdownMenu overlay={this.getHelpMenus()} placement={placement || 'bottom'}>
          <div className={classnames(styles.helpNav)}>
            <span>{formatMessage({ id: 'odc.component.HelpMenus.Help' }) /* 帮助 */}</span>
          </div>
        </DropdownMenu>

        <ModalHelpAbout
          showModal={showModalAbout}
          onCancel={() => {
            this.setState({
              showModalAbout: false,
            });
          }}
        />

        <ModalHelpFeedBack
          showModal={showModalFeedback}
          onCancel={() => {
            this.setState({
              showModalFeedback: false,
            });
          }}
        />

        <VersionModal />
      </>
    );
  }
}
