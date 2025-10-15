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

import { externalTableMenusConfig } from './externalTable';
import { databaseMenusConfig } from './database';
import { functionMenusConfig } from './function';
import { packageMenusConfig } from './package';
import { packageBodyMenusConfig } from './packageBody';
import { procedureMenusConfig } from './procedure';
import { sequenceMenusConfig } from './sequence';
import { synonymMenusConfig } from './synonym';
import { tableMenusConfig } from './table';
import { triggerMenusConfig } from './trigger';
import { typeMenusConfig } from './type';
import { viewMenusConfig } from './view';
import { materializedViewConfig } from './materializedView';
import { externalResourceMenusConfig } from './externalResource';
import { groupNodeMenusConfig } from './groupNode';

export default {
  ...tableMenusConfig,
  ...viewMenusConfig,
  ...sequenceMenusConfig,
  ...synonymMenusConfig,
  ...triggerMenusConfig,
  ...functionMenusConfig,
  ...procedureMenusConfig,
  ...typeMenusConfig,
  ...packageMenusConfig,
  ...packageBodyMenusConfig,
  ...databaseMenusConfig,
  ...externalTableMenusConfig,
  ...materializedViewConfig,
  ...externalResourceMenusConfig,
  ...groupNodeMenusConfig,
};
