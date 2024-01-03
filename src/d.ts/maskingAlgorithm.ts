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

export enum MaskingAlgorithmType {
  MASK = 'MASK',
  SUBSTITUTION = 'SUBSTITUTION',
  PSEUDO = 'PSEUDO',
  HASH = 'HASH',
  ROUND = 'ROUND',
  NULL = 'NULL',
}
export enum SegmentType {
  CUSTOM = 'CUSTOM',
  PRE_1_POST_1 = 'PRE_1_POST_1',
  PRE_3_POST_2 = 'PRE_3_POST_2',
  PRE_3_POST_4 = 'PRE_3_POST_4',
  ALL = 'ALL',
  PRE_3 = 'PRE_3',
  POST_4 = 'POST_4',
}
export enum HashType {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SM3 = 'SM3',
}
export interface IMaskingAlgorithm {
  id?: number;
  name: string;
  enabled: boolean;
  builtin: boolean;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
  type: MaskingAlgorithmType;
  segmentType: SegmentType;
  segments: string[];
  substitution: string;
  charsets: string[];
  hashType: HashType;
  decimal: boolean;
  precision: number;
  sampleContent: string;
  maskedContent: string;
}
