/*
 * Copyright 2024 OceanBase
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

import { ProjectUser } from './project';
import { Level } from './sensitiveColumn';
export enum SensitiveRuleType {
  PATH = 'PATH',
  REGEX = 'REGEX',
  GROOVY = 'GROOVY',
}
export interface ISensitiveRule {
  id?: number;
  name: string;
  enabled: boolean;
  projectId: number;
  type: SensitiveRuleType;
  databaseRegexExpression: string;
  tableRegexExpression: string;
  columnRegexExpression: string;
  columnCommentRegexExpression: string;
  groovyScript: string;
  pathIncludes: string[];
  pathExcludes: string[];
  maskingAlgorithmId: number;
  level: Level;
  description: string;
  builtin: boolean;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
}
