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
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React from 'react';
export function getConfirmTitle(isRollback?: boolean) {
  const text = isRollback
    ? formatMessage({ id: 'odc.component.SubmitConfirm.Rollback', defaultMessage: '回滚' }) //回滚
    : formatMessage({ id: 'odc.component.SubmitConfirm.Submitted', defaultMessage: '提交' }); //提交
  return (
    <div
      style={{
        lineHeight: '20px',
        color: 'var(--text-color-secondary)',
      }}
    >
      <div
        style={{
          color: 'var(--text-color-primary)',
          fontFamily: 'PingFangSC-Semibold',
        }}
      >
        {
          formatMessage(
            {
              id: 'odc.component.SubmitConfirm.ConfirmTheTextCurrentTransaction',
              defaultMessage: '是否确认{text}当前事务？',
            },
            { text },
          ) /*确认{text}当前事务？*/
        }
      </div>
      <div>
        <div>
          {
            formatMessage({
              id: 'odc.component.SubmitConfirm.TheCurrentConnectionUsesA',
              defaultMessage: '当前连接采用共享 Session，',
            }) /*当前连接采用共享session，*/
          }
        </div>
        {text}
        {
          formatMessage({
            id: 'odc.component.SubmitConfirm.TheOperationTakesEffectFor',
            defaultMessage: '操作会对所有窗口生效。',
          }) /*操作会对所有窗口生效。*/
        }
      </div>
    </div>
  );
}

const SubmitConfirm: React.FC<{
  settingStore?: SettingStore;
  onConfirm: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  isRollback?: boolean;
  disabled?: boolean;
}> = function (props) {
  const text = props.isRollback
    ? formatMessage({ id: 'odc.component.SubmitConfirm.Rollback', defaultMessage: '回滚' }) //回滚
    : formatMessage({ id: 'odc.component.SubmitConfirm.Submitted', defaultMessage: '提交' }); //提交
  return (
    <>
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement<any>(child, { onClick: props.onConfirm });
        }
        return child;
      })}
    </>
  );
};

export default inject('settingStore')(observer(SubmitConfirm));
