/**
 * ODC主题相关，全局less变量定义
 */
const antdTheme = {
  'font-size-base': '12px',
  'form-item-margin-bottom': '12px',
  'form-component-max-height': '28px',
  'layout-header-height': '40px',
  'form-vertical-label-padding': '4px 0px 4px 0px',
  'btn-height-base': '28px',
  'padding-md': '12px',
  'input-height-base': '29px',
  'input-height-sm': '25px',
  'pagination-item-size': '24px',
  'border-radius-base': '2px',
  'drawer-body-padding': '12px 24px 24px 24px',
  'tree-bg': 'transparent',
  'drawer-header-close-size': '47px',
};

const odcTheme = {
  // 字体颜色
  'odc-text-color-dark': 'rgba(0, 0, 0, 0.85)',
  'odc-text-color-secondary-dark': 'rgba(0, 0, 0, 0.65)',
  'odc-text-color-secondary-dark2': 'rgba(0, 0, 0, 0.45)',
  'odc-text-color-disabled': 'rgba(0, 0, 0, 0.25)',
  // 边框颜色
  'odc-border-color-dark': 'rgba(0, 0, 0, 0.50)',
  'odc-border-color-secondary-dark': 'rgba(0, 0, 0, 0.25)',
  'odc-border-color-secondary-dark2': 'rgba(0, 0, 0, 0.15)',
  // 阴影颜色
  'odc-shadow-color-dark': 'rgba(0, 0, 0, 0.15)',
};

export default {
  ...antdTheme,
  ...odcTheme,
};
