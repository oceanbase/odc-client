import React from 'react';
import { setLocale } from 'umi';
import { initMetaStore } from './common/metaStore';
import DndHTML5Provider from './component/DndHTML5Provider';
import registerPlugins from './plugins/register';
import { isClient } from './util/env';
import logger from './util/logger';
if (isClient()) {
  import('@sentry/electron').then((Sentry) => {
    Sentry.init({
      dsn: 'https://5ffd98e764c143e09a4cc2970ff6896a@obc-sentry.oceanbase.com/6',
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
