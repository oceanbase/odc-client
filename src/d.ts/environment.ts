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

import type { ProjectUser } from './project';

export interface IEnvironment {
  id: number;
  name: string;
  originalName?: string;
  description: string;
  rulesetId: number;
  rulesetName: string;
  organizationId: number;
  builtIn: boolean;
  createTime: string;
  updateTime: string;
  creator: ProjectUser;
  lastModifier: ProjectUser;
  style: string;
  enabled: boolean;
  copiedRulesetId?: number;
}
export interface DataType {
  key: string;
  envName: string;
  description: string;
  tag: string;
  sqlDevSpecification: string;
  riskSensitiveSpecification: string;
}
export interface Page {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export interface TagType {
  tabContent: string;
  tabStyle: string;
}
