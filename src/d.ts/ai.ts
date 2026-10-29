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

export enum AIQuestionType {
  SQL_OPTIMIZER = 'SQL_OPTIMIZER',
  SQL_DEBUGGING = 'SQL_DEBUGGING',
  NL_2_SQL = 'NL_2_SQL',
  SQL_MODIFIER = 'SQL_MODIFIER',
  SQL_FORMATTING = 'SQL_FORMATTING',
  SQL_COMPLETION = 'SQL_COMPLETION',
}

export enum ESseEventStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
