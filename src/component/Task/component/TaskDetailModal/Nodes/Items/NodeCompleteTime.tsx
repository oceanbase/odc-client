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

import { ITaskFlowNode } from '@/d.ts';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import React from 'react';

interface IProps {
  node: Partial<ITaskFlowNode>;
}

const NodeCompleteTime: React.FC<IProps> = function ({ node }) {
  const { completeTime } = node;
  return <span>{getLocalFormatDateTime(completeTime)}</span>;
};

export default NodeCompleteTime;
