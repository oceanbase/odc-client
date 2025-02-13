import { ThemeConfig } from 'antd/es';

export const theme: ThemeConfig = {
  token: {
    fontSize: 12,
    controlHeight: 28,
    borderRadius: 2,
  },
  components: {
    Tree: {
      titleHeight: 24,
      colorBgContainer: 'transparent',
      paddingXS: 4,
    },
    Input: {},
    Tooltip: {},
    Menu: {
      itemBorderRadius: 0,
      horizontalItemBorderRadius: 0,
      subMenuItemBorderRadius: 0,
    },
    Modal: {
      contentBg: 'var(--background-primary-color)',
    },
  },
};
