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

import { formatMessage } from '@/util/intl';
import { TaskPartitionStrategy, TaskErrorStrategy } from '@/d.ts';

export const ErrorStrategyMap = {
  [TaskErrorStrategy.ABORT]: formatMessage({ id: 'src.component.Task.F0079010' }), //'停止任务'
  [TaskErrorStrategy.CONTINUE]: formatMessage({ id: 'src.component.Task.2DA054B9' }), //'忽略错误继续任务'
};

export const TaskPartitionStrategyMap = {
  [TaskPartitionStrategy.CREATE]: formatMessage({ id: 'src.component.Task.CD347F96' }), //'创建策略'
  [TaskPartitionStrategy.DROP]: formatMessage({ id: 'src.component.Task.9262EB40' }), //'删除策略'
};
