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
          formatMessage({ id: 'odc.page.Lock.ThePasswordIsInvalid' }), // 密码错误！
        );
      }
    } catch (e) {
      console.error(e);
      message.error(
        formatMessage({ id: 'odc.page.Lock.SystemException' }), // 系统异常
      );
    }
    setLoading(false);
  }
  function resetPassword() {
    Modal.confirm({
      title: formatMessage({ id: 'odc.page.Lock.AreYouSureYouWant' }), // 确定要重置所有数据吗？
      content: formatMessage({
        id: 'odc.page.Lock.WillAllConnectionsAndPasswords',
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
        })}
        /* 请输入解锁密码 */
        onPressEnter={unLock}
        addonAfter={
          loading ? (
            <a
              title={
                formatMessage({ id: 'odc.page.Lock.Unlocking' }) // 解锁中
              }
            >
              <LoadingOutlined />
            </a>
          ) : (
            <a
              title={
                formatMessage({ id: 'odc.page.Lock.Unlock' }) // 解锁
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
            })
            /* 忘记密码？尝试 */
          }

          <a onClick={resetPassword}>
            {formatMessage({ id: 'odc.page.Lock.ResetData' }) /* 重置数据 */}
          </a>
        </span>
      ) : null}
    </div>
  );
};

export default LockPage;
