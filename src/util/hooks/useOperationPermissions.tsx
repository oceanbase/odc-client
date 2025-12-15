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

import { ProjectRole } from '@/d.ts/project';
import userStore from '@/store/login';
import { IOperationTypeRole } from '@/d.ts/schedule';
import { useMemo } from 'react';

interface IProps {
  currentUserResourceRoles: ProjectRole[];
  approvable?: boolean;
  createrId?: number;
  approveByCurrentUser?: boolean;
}

/** 项目权限转换为自定义权限 */
const ProjectRole2IOperationTypeRole = {
  [ProjectRole.DEVELOPER]: IOperationTypeRole.PROJECT_DEVELOPER,
  [ProjectRole.DBA]: IOperationTypeRole.PROJECT_DBA,
  [ProjectRole.OWNER]: IOperationTypeRole.PROJECT_OWNER,
  [ProjectRole.SECURITY_ADMINISTRATOR]: IOperationTypeRole.PROJECT_SECURITY_ADMINISTRATOR,
  [ProjectRole.PARTICIPANT]: IOperationTypeRole.PROJECT_PARTICIPANT,
};

/** 将权限转换为自定义权限，用于工单、作业 */
const useOperationPermissions = (params: IProps): { IRoles: IOperationTypeRole[] } => {
  const { currentUserResourceRoles, approvable, createrId, approveByCurrentUser } = params;
  const { user } = userStore;

  const IRoles: IOperationTypeRole[] = useMemo(() => {
    const _IRoles: IOperationTypeRole[] = [];
    user?.id === createrId && _IRoles.push(IOperationTypeRole.CREATOR);
    approvable && approveByCurrentUser && _IRoles.push(IOperationTypeRole.APPROVER);
    currentUserResourceRoles?.forEach((role) => {
      _IRoles.push(ProjectRole2IOperationTypeRole[role]);
    });
    return _IRoles;
  }, [currentUserResourceRoles, approvable, user?.id, createrId]);

  return {
    IRoles,
  };
};

export default useOperationPermissions;
