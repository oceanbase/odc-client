import { ThemeConfig } from 'antd/es';

export const theme: ThemeConfig = {
  token: {
    fontSize: 12,
    controlHeight: 28,
  },
  components: {
    Tree: {
      titleHeight: 24,
      colorBgContainer: 'transparent',
      paddingXS: 4,
    },
    Input: {},
    Tooltip: {},
  },
};
