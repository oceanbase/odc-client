import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import MySQLColumnExtra from '../oceanbase/MySQLColumnExtra';
import { haveOCP } from '@/util/env';

const CloudStorageConfig: IDataSourceModeConfig = {
  connection: {
    address: {
      items: ['ip'],
    },
    account: false,
    sys: false,
    ssl: false,
    disableURLParse: true,
    cloudStorage: true,
    disableExtraConfig: true,
  },
  features: {
    task: [TaskType.DATA_ARCHIVE, TaskType.DATA_DELETE],
    obclient: false,
    recycleBin: false,
    sessionManage: false,
    sessionParams: false,
    sqlExplain: false,
    resourceTree: false,
    export: {
      fileLimit: false,
      snapshot: false,
    },
  },
};

const ALIYUN: Record<ConnectType.OSS, IDataSourceModeConfig> = {
  [ConnectType.OSS]: CloudStorageConfig,
};
const AWSS3: Record<ConnectType.S3A, IDataSourceModeConfig> = {
  [ConnectType.S3A]: CloudStorageConfig,
};

const HUAWEI: Record<ConnectType.OBS, IDataSourceModeConfig> = {
  [ConnectType.OBS]: CloudStorageConfig,
};

const QCLOUD: Record<ConnectType.COS, IDataSourceModeConfig> = {
  [ConnectType.COS]: CloudStorageConfig,
};

export default { ALIYUN, AWSS3, HUAWEI, QCLOUD };
