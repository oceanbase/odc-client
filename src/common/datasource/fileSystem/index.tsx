import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import { haveOCP } from '@/util/env';

const CloudStorageConfig: IDataSourceModeConfig = {
  isFileSystem: true,
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
    task: [TaskType.DATA_ARCHIVE],
    obclient: false,
    recycleBin: false,
    sessionManage: false,
    sessionParams: false,
    sqlExplain: false,
    resourceTree: true,
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
