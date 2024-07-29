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
import { LoadingOutlined, LoginOutlined } from '@ant-design/icons';
import { Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import { history } from '@umijs/max';

import { ReactComponent as LogoOB } from '@/svgr/LogoOB.svg';

import ipcInvoke from '@/util/client/service';
import styles from './index.less';

interface ILockProps {}

const LockPage: React.FC<ILockProps> = function (props) {
  const [errCount, setErrCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pwd, setPwd] = useState(null);
  async function unLock() {
    setLoading(true);
    try {
      const processLockKey = await ipcInvoke('checkLockPwd', pwd);
      if (processLockKey) {
        localStorage.setItem('lockKey', processLockKey);
        // @ts-ignore
        history.back();
      } else {
        setErrCount(errCount + 1);
        message.error(
          formatMessage({ id: 'odc.page.Lock.ThePasswordIsInvalid', defaultMessage: '密码错误！' }), // 密码错误！
        );
      }
    } catch (e) {
      console.error(e);
      message.error(
        formatMessage({ id: 'odc.page.Lock.SystemException', defaultMessage: '系统异常' }), // 系统异常
      );
    }
    setLoading(false);
  }
  function resetPassword() {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.page.Lock.AreYouSureYouWant',
        defaultMessage: '是否确定重置所有数据？',
      }), // 确定要重置所有数据吗？
      content: formatMessage({
        id: 'odc.page.Lock.WillAllConnectionsAndPasswords',
        defaultMessage: '重置后将删除所有连接，并且删除密码？',
      }),
      // 重置后将删除所有连接，并且删除密码？
      onOk() {
        ipcInvoke('resetSystem');
      },
    });
  }
  return (
    <div className={styles.lockpage}>
      <div className={styles.bg}>
        <LogoOB style={{ transform: 'scale(5)' }} />
      </div>
      <span style={{ marginBottom: 12 }}>
        <img style={{ width: 200 }} src={getLocalImg('version_icon.png')} />
      </span>
      <Input.Password
        style={{ width: 200 }}
        value={pwd}
        onChange={(e) => {
          setPwd(e.target.value);
        }}
        placeholder={formatMessage({
          id: 'odc.page.Lock.EnterTheUnlockPassword',
          defaultMessage: '请输入解锁密码',
        })}
        /* 请输入解锁密码 */
        onPressEnter={unLock}
        addonAfter={
          loading ? (
            <a
              title={
                formatMessage({ id: 'odc.page.Lock.Unlocking', defaultMessage: '解锁中' }) // 解锁中
              }
            >
              <LoadingOutlined />
            </a>
          ) : (
            <a
              title={
                formatMessage({ id: 'odc.page.Lock.Unlock', defaultMessage: '解锁' }) // 解锁
              }
              style={{ color: 'rgba(0,0,0,0.65)' }}
              onClick={unLock}
            >
              <LoginOutlined />
            </a>
          )
        }
      />

      {errCount >= 3 ? (
        <span style={{ marginTop: 5 }}>
          {
            formatMessage({
              id: 'odc.page.Lock.ForgotThePasswordTry',
              defaultMessage: '忘记密码？尝试',
            })
            /* 忘记密码？尝试 */
          }

          <a onClick={resetPassword}>
            {
              formatMessage({
                id: 'odc.page.Lock.ResetData',
                defaultMessage: '重置数据',
              }) /* 重置数据 */
            }
          </a>
        </span>
      ) : null}
    </div>
  );
};

export default LockPage;
