import { ThemeConfig } from 'antd/es';

const colorToken = {
  action: '#006aff',
  warning: '#ffa21a',
  error: '#f93939',
  success: '#0ac185',
};

export const theme: ThemeConfig = {
  token: {
    fontSize: 12,
    controlHeight: 28,
    borderRadius: 2,
    colorText: 'var(--text-color-primary)',
    colorTextSecondary: 'var(--text-color-hint)',
    colorTextTertiary: 'var(--text-color-hint)',
    colorBgContainerDisabled: 'var(--forbiden-color)',
    colorTextDisabled: 'var(--text-color-placeholder)',
    colorTextPlaceholder: 'var(--text-color-placeholder)',
    colorIcon: 'var(--icon-color-normal)',
    colorSplit: 'var(--divider-color)',

    // antd seed token 只能读具体值，无法读取 less 变量
    colorPrimary: colorToken.action,
    colorLink: colorToken.action,
    colorWarning: colorToken.warning,
    colorError: colorToken.error,
    colorSuccess: colorToken.success,
  },
  components: {
    Tree: {
      titleHeight: 24,
      colorBgContainer: 'transparent',
      paddingXS: 4,
    },
    Transfer: {
      colorIcon: 'var(--icon-color-normal)',
      colorBorder: 'var(--odc-border-color)',
    },
    Radio: {
      colorPrimaryBorder: 'var(--odc-border-color)',
    },
    Drawer: {
      colorBorder: 'var(--odc-border-color)',
      colorSplit: 'var(--odc-border-color)',
    },
    Divider: {
      colorSplit: 'var(--divider-color)',
    },
    Input: {
      colorBorder: 'var(--odc-border-color)',
      colorIcon: 'var(--icon-color-normal)',
    },
    Collapse: {
      colorBorder: 'var(--odc-border-color)',
    },
    InputNumber: {
      colorBorder: 'var(--odc-border-color)',
    },
    Tabs: {
      colorBorder: 'var(--odc-border-color)',
    },
    Select: {
      colorBorder: 'var(--odc-border-color)',
      colorIcon: 'var(--icon-color-normal)',
    },
    Checkbox: {
      colorBorder: 'var(--odc-border-color)',
    },
    Menu: {
      itemBorderRadius: 0,
      horizontalItemBorderRadius: 0,
      subMenuItemBorderRadius: 0,
    },
    Dropdown: {
      controlItemBgActive: 'var(--hover-color)',
    },
    Button: {
      defaultBorderColor: 'var(--odc-border-color)',
    },
    Table: {
      colorTextHeading: 'var(--text-color-primary)',
      borderColor: 'var(--table-border-color)',
      headerBg: 'var(--table-header-background-color)',
    },
    Modal: {
      contentBg: 'var(--background-primary-color)',
    },
  },
};
