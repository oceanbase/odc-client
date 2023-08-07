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

interface IProps {}

const HelpItem: React.FC<IProps> = function ({ children }) {
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [showModalAbout, setShowModalAbout] = useState(false);

  const HELP_MENUS = [
    !isClient() && {
      title: formatMessage({ id: 'odc.Sider.HelpItem.Features' }), //功能介绍
      key: 'versionInfo',
      action() {
        modal.changeVersionModalVisible(true);
      },
    },

    {
      title: formatMessage({ id: 'odc.Sider.HelpItem.HelpDocument' }), //帮助文档
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
      action() {
        setShowModalAbout(true);
      },
    },

    {
      title: formatMessage({ id: 'odc.component.GlobalHeader.Feedback' }),
      key: 'feedback',
      action() {
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
      <DropMenu menu={getHelpMenus()}>{children}</DropMenu>

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
