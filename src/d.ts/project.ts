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
  members: {
    id: number;
    accountName: string;
    name: string;
    role: ProjectRole;
  }[];
  builtin: boolean;
  organizationId: number;
  createTime: number;
  updateTime: number;
  creator: ProjectUser;
  lastModifier: ProjectUser;
}
