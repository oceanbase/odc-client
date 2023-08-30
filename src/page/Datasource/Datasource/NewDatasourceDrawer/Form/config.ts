import { ConnectType } from '@/d.ts';

export interface IConfig {
  address: {
    items: ('ip' | 'port' | 'cluster' | 'tenant')[];
  };
  account: boolean;
  sys: boolean;
  ssl: boolean;
  defaultSchema?: boolean;
}
const OBFullConfig: IConfig = {
  address: {
    items: ['ip', 'port', 'cluster', 'tenant'],
  },
  account: true,
  sys: true,
  ssl: true,
};
const OBCloudConfig: IConfig = {
  address: {
    items: ['ip', 'port'],
  },
  account: true,
  sys: true,
  ssl: true,
};
const dataSourceConfig: Record<ConnectType, IConfig> = {
  [ConnectType.OB_MYSQL]: OBFullConfig,
  [ConnectType.OB_ORACLE]: OBFullConfig,
  [ConnectType.CLOUD_OB_MYSQL]: OBCloudConfig,
  [ConnectType.CLOUD_OB_ORACLE]: OBCloudConfig,
  [ConnectType.ODP_SHARDING_OB_MYSQL]: {
    address: {
      items: ['ip', 'port'],
    },
    account: true,
    sys: false,
    ssl: true,
    defaultSchema: true,
  },
  [ConnectType.MYSQL]: {
    address: {
      items: ['ip', 'port'],
    },
    account: true,
    sys: false,
    ssl: false,
  },
  [ConnectType.NONE]: {
    address: {
      items: ['ip', 'port'],
    },
    account: false,
    sys: false,
    ssl: false,
  },
};
export default dataSourceConfig;
