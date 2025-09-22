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
