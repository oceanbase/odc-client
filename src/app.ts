import React from 'react';
import { setLocale } from 'umi';
import { initMetaStore } from './common/metaStore';
import DndHTML5Provider from './component/DndHTML5Provider';
import registerPlugins from './plugins/register';
import { isClient } from './util/env';
import logger from './util/logger';
import { getRoute } from './util/tracert/userRoutes';
if (isClient()) {
  import('@sentry/electron').then((Sentry) => {
    Sentry.init({
      dsn: 'https://859452cf23044aeda8677a8bdcc53081@obc-sentry.oceanbase.com/3',
    });
  });
}

// TODO: 非云上场景不应该 export qiankun
export const qiankun = {
  // 应用加载之前
  async bootstrap() {
    // console.log('odc bootstrap');
  },
  // 应用 render 之前触发
  async mount(props: any) {
    logger.log(props);
    // @ts-ignore
    window._odc_params = props;
    // TODO：支持英文版
    if (props && props.locale) {
      logger.log('[setLocale] props.locale', props.locale);
      setLocale(props.locale, false);
    } else {
      // setLocale('zh-CN', false);
    }
  },
  // 应用卸载之后触发
  async unmount() {
    // console.log('odc unmount');
    window._odc_params = null;
  },
};

export async function render(oldRender: () => void) {
  registerPlugins();
  await initMetaStore();
  oldRender();
}

export function rootContainer(container) {
  return React.createElement(DndHTML5Provider, null, container);
}

export function onRouteChange(routes: any) {
  const tracert = window['Tracert'];
  if (!tracert) {
    return;
  }

  const routeInfo = getRoute(routes, tracert);
  if (routeInfo) {
    // 设置信息
    tracert.call('set', routeInfo);
    // 触发 PV
    tracert.call('logPv');
  }
}
