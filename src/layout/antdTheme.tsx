import { ThemeConfig } from 'antd/es';

export const theme: ThemeConfig = {
  token: {
    fontSize: 12,
    controlHeight: 28,
    borderRadius: 2,
    colorText: '#132039',
    colorTextTertiary: 'var(--text-color-hint)',
  },
  components: {
    Tree: {
      titleHeight: 24,
      colorBgContainer: 'transparent',
      paddingXS: 4,
    },
    Tooltip: {},
    Input: {
      colorBorder: '#CDD5E4',
      colorTextPlaceholder: '#C1CBE0',
    },
    Select: {
      colorBorder: '#CDD5E4',
      colorTextPlaceholder: '#C1CBE0',
    },
    Checkbox: {
      colorBorder: '#CDD5E4',
    },
    Menu: {
      itemBorderRadius: 0,
      horizontalItemBorderRadius: 0,
      subMenuItemBorderRadius: 0,
    },
    Button: {
      defaultBorderColor: '#CDD5E4',
    },
    Table: {
      colorTextHeading: 'var(--text-color-primary)',
    },
    Modal: {
      contentBg: 'var(--background-primary-color)',
    },
  },
};
