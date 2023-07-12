export enum ProjectRole {
  DEVELOPER = 'DEVELOPER',
  DBA = 'DBA',
  OWNER = 'OWNER',
}

export interface ProjectUser {
  id: number;
  name: string;
  accountName: string;
  roleNames: string[];
}

export interface IProject {
  id: number;
  name: string;
  description: string;
  archived: boolean;
  members: {
    id: number;
    accountName: string;
    name: string;
    role: ProjectRole;
  }[];
  currentUserResourceRoles: ProjectRole[];
  builtin: boolean;
  organizationId: number;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}
