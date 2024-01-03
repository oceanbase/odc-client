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

import { MaskRuleSegmentsType } from '.';
import { ProjectUser } from './project';
export enum MaskingRuleType {
  MASK = 'MASK',
  SUBSTITUTION = 'SUBSTITUTION',
  PSEUDO = 'PSEUDO',
  HASH = 'HASH',
  ROUND = 'ROUND',
  NULL = 'NULL',
}
export enum MaskSegmentType {
  DIGIT = 'DIGIT',
  DIGIT_PERCENTAGE = 'DIGIT_PERCENTAGE',
  LEFT_OVER = 'LEFT_OVER',
  DELIMITER = 'DELIMITER',
}
export interface MaskSegment {
  mask: boolean;
  type: MaskSegmentType;
  replacedCharacters: string;
  delimiter: string;
  digitPercentage: number;
  digitNumber: number;
}
export enum MaskingRuleHashType {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SM3 = 'SM3',
}
export interface IMaskingRule {
  id?: number;
  name: string;
  type: MaskingRuleType;
  creator: ProjectUser;
  organizationId: number;
  enabled: boolean;
  builtIn: boolean;
  createTime: number;
  updateTime: number;
  testValue: string;
  segmentsType: MaskRuleSegmentsType;
  segments: MaskSegment[];
  decimal: boolean;
  precisiion: number;
  characterCollection: string[];
  hashType: MaskingRuleHashType;
}

export interface MaskingRule {
  id: number;
  name: string;
  type: MaskingRuleType;
  creator: ProjectUser;
  organizationId: number;
  enabled: boolean;
  builtIn: boolean;
  createTime: number;
  updateTime: number;
  testValue: string;
  segmentsType: MaskSegmentType;
  replacedCharacters: string;
  segments: MaskSegment[];
  decimal: boolean;
  precision: number;
  characterCollection: string[];
}
export interface MaskingRuleApplying {
  rule: MaskingRule;
  includes: string[];
  excludes: string[];
}
export interface IMaskingPolicy {
  id: number;
  name: string;
  ruleApplyings: MaskingRuleApplying[];
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
}
