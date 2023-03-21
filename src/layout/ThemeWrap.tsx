import { SettingStore } from '@/store/setting';
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
      setTimeout(() => {
        setMaskMode(null);
        document.head.removeChild(disableDurationStyle);
      }, 500);
    }
    return () => {
      document.body.classList.remove(className);
    };
  }, [settingStore.theme, setMaskMode]);
  return (
    <>
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
    </>
  );
};

export default inject('settingStore')(observer(ThemeWrap));
