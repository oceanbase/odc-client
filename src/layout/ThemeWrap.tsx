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

import { EThemeConfigKey, SettingStore } from '@/store/setting';
import { ConfigProvider, theme as AntdTheme } from 'antd/es';
import { Outlet } from '@umijs/max';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

interface IProps {
  settingStore: SettingStore;
}

const ThemeWrap: React.FC<IProps> = function ({ children, settingStore }) {
  const [maskMode, setMaskMode] = useState<'dark' | 'white'>(null);
  useEffect(() => {
    const theme = settingStore.theme;
    const className = theme.className;
    if (theme) {
      setMaskMode(theme.maskType);
      /**
       * 这里加一个禁用动画目的是让整个画面变化的更加块，不会有拖影的感觉。
       */
      const disableDurationStyle = document.createElement('style');
      disableDurationStyle.setAttribute('type', 'text/css');
      disableDurationStyle.innerHTML = `
      *{
        transition-duration: 0s !important;
      }
      `;
      document.head.appendChild(disableDurationStyle);
      document.body.classList.add(className);
      if (theme.key === EThemeConfigKey.ODC_DARK) {
        ConfigProvider.config({
          theme: {
            algorithm: AntdTheme.darkAlgorithm,
          },
        });
      }
      setTimeout(() => {
        setMaskMode(null);
        document.head.removeChild(disableDurationStyle);
      }, 500);
    }
    return () => {
      document.body.classList.remove(className);
      ConfigProvider.config({
        theme: {
          algorithm: AntdTheme.defaultAlgorithm,
        },
      });
    };
  }, [settingStore.theme, setMaskMode]);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          settingStore.theme?.key === EThemeConfigKey.ODC_DARK
            ? AntdTheme.darkAlgorithm
            : AntdTheme.defaultAlgorithm,
      }}
    >
      {maskMode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            animationName: maskMode === 'dark' ? 'odcDarkMask' : 'odcWhiteMask',
            animationDuration: '0.3s',
          }}
        />
      )}
      <Outlet />
    </ConfigProvider>
  );
};

export default inject('settingStore')(observer(ThemeWrap));
