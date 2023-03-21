import type { ModalStore } from '@/store/modal';
import modal from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Image, Menu, Modal } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import { getCurrentVersionInfo } from './config';

import localLoginHistoy from '@/service/localLoginHistoy';
import type { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { checkHasAskPermission, isClient } from '@/util/env';
import styles from './index.less';

const cookiesKey = 'versionInfoKey';
interface IProps {
  modalStore?: ModalStore;
  userStore?: UserStore;
  settingStore?: SettingStore;
}

export function showVersionModal(modalStore: ModalStore, id: number, settingStore: SettingStore) {
  if (!isNil(id)) {
    const isNewUser = localLoginHistoy.isNewUser();
    if (isNewUser) {
      localLoginHistoy.registerUser();
      settingStore.enableVersionTip && modalStore.changeVersionModalVisible(true);
    }
  }
}

export interface VersionMenuType {
  title: string;
  content: React.ReactNode;
  img: string;
  /**
   * 图片颜色类型
   */
  imgType?: 'white' | 'dark';
  /**
   * 是否为管理员可见
   */
  root?: boolean;
}

const VersionModal: React.FC<IProps> = (props) => {
  const { modalStore, userStore, settingStore } = props;
  const [activeKey, setActiveKey] = useState(0);
  const onCancel = useCallback(() => {
    modal.changeVersionModalVisible(false);
  }, []);

  useEffect(() => {
    // 在客户端上假如还未弹出过用户埋点授权弹窗的话，先不弹出VersionModal，其他环境下不受影响;
    if (isClient() && !checkHasAskPermission()) {
      modalStore.changeVersionModalVisible(false);
      return;
    }
    showVersionModal(modalStore, userStore.user?.id, settingStore);
  }, [modalStore, userStore.user?.id]);

  const menuList = getCurrentVersionInfo();

  return (
    <Modal
      visible={modalStore.versionModalVisible}
      onCancel={onCancel}
      footer={null}
      width={720}
      wrapClassName={styles.modal}
    >
      <div className={styles.box}>
        <div className={styles.menu}>
          <div className={styles.menuTitle}>
            {
              formatMessage({
                id: 'odc.component.VersionModal.ProductFunctionIntroduction',
              }) /* 产品功能介绍 */
            }
          </div>
          <Menu
            selectedKeys={[activeKey.toString()]}
            onSelect={({ key }) => {
              setActiveKey(parseInt(key as string));
            }}
            className={styles.menuContent}
          >
            {menuList.map((menu, index) => {
              return <Menu.Item key={index.toString()}>{menu.title}</Menu.Item>;
            })}
          </Menu>
          <Button
            className={styles.menuBtn}
            onClick={() => {
              if (activeKey === menuList.length - 1) {
                modal.changeVersionModalVisible(false);
              } else {
                setActiveKey(activeKey + 1);
              }
            }}
          >
            {
              activeKey === menuList.length - 1
                ? formatMessage({ id: 'odc.component.VersionModal.ISee' }) // 我知道了
                : formatMessage({ id: 'odc.component.VersionModal.Next' }) // 下一个
            }
          </Button>
        </div>
        <div className={styles.content}>
          <div className={styles.contentImg}>
            <Image width="100%" src={menuList[activeKey]?.img} preview={false} />
          </div>
          <div className={styles.contentText}>{menuList[activeKey]?.content}</div>
        </div>
      </div>
    </Modal>
  );
};

export default inject('modalStore', 'userStore', 'settingStore')(observer(VersionModal));
