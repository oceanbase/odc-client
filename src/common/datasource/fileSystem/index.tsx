/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConnectType, TaskType } from '@/d.ts';
import { IDataSourceModeConfig } from '../interface';
import { haveOCP } from '@/util/env';
import { ScheduleType } from '@/d.ts/schedule';

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
    task: [],
    schedule: [ScheduleType.DATA_ARCHIVE],
    sqlconsole: false,
    obclient: false,
    recycleBin: false,
    sessionManage: false,
    sessionParams: false,
    sqlExplain: false,
    groupResourceTree: false,
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
