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

import ModalHelpAbout from '@/component/HelpMenus/components/ModalHelpAbout';
import ModalHelpFeedBack from '@/component/HelpMenus/components/ModalHelpFeedBack';
import VersionModal from '@/component/VersionModal';
import odc from '@/plugins/odc';
import modal from '@/store/modal';
import { isClient } from '@/util/env';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Menu } from 'antd';
import React, { useState } from 'react';
import DropMenu from '../DropMenu';
import tracert from '@/util/tracert';

interface IProps {}

const HelpItem: React.FC<IProps> = function ({ children }) {
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [showModalAbout, setShowModalAbout] = useState(false);

  const HELP_MENUS = [
    !isClient() && {
      title: formatMessage({ id: 'odc.Sider.HelpItem.Features' }), //功能介绍
      key: 'versionInfo',
      action() {
        tracert.click('a3112.b46782.c330849.d367361');
        modal.changeVersionModalVisible(true);
      },
    },

    {
      title: formatMessage({ id: 'odc.Sider.HelpItem.HelpDocument' }), //帮助文档
      key: 'pdf',
      action() {
        tracert.click('a3112.b46782.c330849.d367362');
        window.open(odc.appConfig.docs.url || getLocalDocs());
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.GlobalHeader.AboutDeveloperCenter',
      }),

      key: 'about',
      action() {
        tracert.click('a3112.b46782.c330849.d367363');
        setShowModalAbout(true);
      },
    },

    {
      title: formatMessage({ id: 'odc.component.GlobalHeader.Feedback' }),
      key: 'feedback',
      action() {
        tracert.click('a3112.b46782.c330849.d367364');
        setShowModalFeedback(true);
      },
    },
  ].filter(Boolean);

  const getHelpMenus = () => {
    return (
      <Menu selectedKeys={null}>
        {HELP_MENUS.map((item) => (
          <Menu.Item key={item.key} onClick={item.action}>
            {item.title}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  return (
    <>
      <DropMenu
        onOpenChange={(v: boolean) => {
          if (v) {
            tracert.expo('a3112.b46782.c330849');
          }
        }}
        menu={getHelpMenus()}
      >
        {children}
      </DropMenu>

      <ModalHelpAbout
        showModal={showModalAbout}
        onCancel={() => {
          setShowModalAbout(false);
        }}
      />

      <ModalHelpFeedBack
        showModal={showModalFeedback}
        onCancel={() => {
          setShowModalFeedback(false);
        }}
      />

      <VersionModal />
    </>
  );
};

export default HelpItem;
