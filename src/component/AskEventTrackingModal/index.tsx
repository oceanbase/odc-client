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
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { checkHasAskPermission } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Button, List, Modal, Popover } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { showVersionModal } from '../VersionModal';
import styles from './index.less';

interface IProps {
  modalStore?: ModalStore;
  userStore?: UserStore;
  settingStore?: SettingStore;
}
const popoverContent: React.FC = () => {
  const listData: string[] = [
    formatMessage({ id: 'odc.component.AskEventTrackingModal.Login', defaultMessage: '登录' }), //登录
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.ThirdPartyJumpPage',
      defaultMessage: '第三方跳转页面',
    }), //第三方跳转页面
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.ApplicationPassword',
      defaultMessage: '应用密码',
    }), //应用密码
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.ConnectionList',
      defaultMessage: '连接列表',
    }), //连接列表
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.Workbench',
      defaultMessage: '工作台',
    }), //工作台
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.ControlDesk',
      defaultMessage: '管控台',
    }), //管控台
    formatMessage({ id: 'odc.component.AskEventTrackingModal.Error', defaultMessage: '404 报错' }), //404报错
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.Error.1',
      defaultMessage: '403 报错',
    }), //403报错
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.SqlWindow',
      defaultMessage: 'SQL 窗口',
    }), //SQL窗口
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.SessionManagement',
      defaultMessage: '会话管理',
    }), //会话管理
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.TableDetails',
      defaultMessage: '表详情',
    }), //表详情
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.RecycleBin',
      defaultMessage: '回收站',
    }), //回收站
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.TutorialWindow',
      defaultMessage: '教程窗口',
    }), //教程窗口
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.TutorialList',
      defaultMessage: '教程列表',
    }), //教程列表
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.CreateSimulationData',
      defaultMessage: '创建模拟数据',
    }), //创建模拟数据
    formatMessage({
      id: 'odc.component.AskEventTrackingModal.TaskCenter',
      defaultMessage: '任务中心',
    }), //任务中心
  ];

  return (
    <div className={styles.infolist}>
      <p>
        {
          formatMessage({
            id: 'odc.component.AskEventTrackingModal.OdcDoesNotCollectPersonal',
            defaultMessage: 'ODC 不会收集用户的个人信息，仅采集以下页面的使用频率：',
          }) /*ODC不会收集用户的个人信息，仅采集以下页面的使用频率：*/
        }
      </p>
      <List dataSource={listData} renderItem={(item) => <List.Item>{item}</List.Item>} />
    </div>
  );
};
const AskeventTrackingPermissionModal: React.FC<IProps> = (props: IProps) => {
  const { modalStore, userStore, settingStore } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const openVersionModal = () => {
    setVisible(false);
    // 为了在客户端上得到正确的弹窗顺序，这里需要替VersionModal处理一部分逻辑，关闭埋点授权弹窗后，检查是否需要开启VersionModal。
    showVersionModal(modalStore, userStore.user?.id, settingStore);
  };
  // 将用户信息采集授权情况存储到localStorage上，默认不开启埋点。
  const setEventTrackingPermission = (flag: boolean = false) => {
    localStorage.setItem('eventTrackingPermission', flag.toString());
  };
  const save = () => {
    setEventTrackingPermission(true);
    openVersionModal();
  };
  const cancel = () => {
    setEventTrackingPermission(false);
    openVersionModal();
  };
  useEffect(() => {
    // 假如未弹出过信息采集许可弹窗，则弹出弹窗。
    setVisible(!checkHasAskPermission());
  }, []);
  return (
    <Modal
      style={{ width: '400px' }}
      centered
      closable={false}
      destroyOnClose
      maskClosable={false}
      open={visible}
      onOk={save}
      okText={
        formatMessage({ id: 'odc.component.AskEventTrackingModal.Agree', defaultMessage: '同意' }) //同意
      }
      cancelText={
        formatMessage({
          id: 'odc.component.AskEventTrackingModal.Disagree',
          defaultMessage: '不同意',
        }) //不同意
      }
      onCancel={cancel}
    >
      <div>
        <p>
          {
            formatMessage({
              id: 'odc.component.AskEventTrackingModal.InOrderToImproveAnd',
              defaultMessage:
                '为了改进和开发我们的产品，以便给您提供更好的服务，ODC 在运行过程中会收集部分模块的使用频次信息。',
            }) /*为了改进和开发我们的产品，以便给您提供更好的服务，ODC在运行过程中会收集部分模块的使用频次信息。*/
          }
        </p>
        <Popover placement={'right'} content={popoverContent}>
          <Button
            style={{
              color: 'var(--brand-blue6-color)',
              paddingLeft: 0,
              paddingRight: 0,
              background: 'var(--neutral-White100-color)',
            }}
            type="text"
          >
            {
              formatMessage({
                id: 'odc.component.AskEventTrackingModal.InformationCollectionList',
                defaultMessage: '信息采集列表',
              }) /*信息采集列表*/
            }
          </Button>
        </Popover>
      </div>
    </Modal>
  );
};
export default inject(
  'modalStore',
  'userStore',
  'settingStore',
)(observer(AskeventTrackingPermissionModal));
