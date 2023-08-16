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

import { getProject } from '@/common/network/project';
import login from '@/store/login';
import logger from '@/util/logger';
import { safeParseJson } from '@/util/utils';
import { history } from '@umijs/max';

const keyBuilder = function () {
  const organizationId = login.organizationId;
  const userId = login.user?.id;
  if (!organizationId || !userId) {
    return null;
  }
  return `odcProjectHistory-o:${organizationId}-u:${userId}`;
};

function getData() {
  return safeParseJson(window.localStorage.getItem(keyBuilder()));
}

export function getDefaultProject() {
  const data = getData();
  if (data) {
    return parseInt(getData());
  }
}

export function setDefaultProject(projectId: number) {
  const key = keyBuilder();
  if (!key) {
    logger.warn('key not found');
    return;
  }
  window.localStorage.setItem(key, projectId?.toString());
}

export async function toDefaultProjectPage() {
  const projectId = getDefaultProject();
  if (!projectId) {
    history.push('/project');
  } else {
    const project = await getProject(projectId);
    const isProjectAvailable = project && !project?.archived;
    isProjectAvailable ? history.push(`/project/${projectId}/database`) : history.push('/project');
  }
}
