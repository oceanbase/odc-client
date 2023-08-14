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

import { PageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const PLPageMap = {
  [PageType.BATCH_COMPILE_FUNCTION]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Function' }), //函数
  },
  [PageType.BATCH_COMPILE_PROCEDURE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }), //存储过程
  },
  [PageType.BATCH_COMPILE_PACKAGE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Bag' }), //包
  },
  [PageType.BATCH_COMPILE_TRIGGER]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), //触发器
  },
  [PageType.BATCH_COMPILE_TYPE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Type' }), //类型
  },
};
