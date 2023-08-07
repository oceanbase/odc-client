import type { IManagerUser } from '@/d.ts';

export default {
  login: {
    menu: true,
  },
  locale: {
    menu: true,
    getLocale: null,
  },
  docs: {
    url: null,
  },
  worker: {
    needOrigin: true,
  },
  debug: {
    enable: true,
  },
  manage: {
    user: {
      create: true,
      resetPwd: true,
      delete: true,
      isAdmin: (user: IManagerUser) => {
        return user?.builtIn && user?.accountName === 'admin';
      },
      tabInVisible: (setting) => {
        return false;
      },
    },
    record: {
      enable: (setting) => {
        return true;
      },
    },
    showRAMAlert: (setting) => {
      return false;
    },
  },
  connection: {
    sys: true,
  },
  task: {
    sys: true,
  },
  systemConfig: {
    default: null,
  },
  spm: {
    enable: true,
  },
  workspace: {
    preMount() {},
    unMount() {},
  },
};
