import { IManagerResourceType, TaskSubType, TaskType } from '@/d.ts';
export interface ITaskFlowConfig {
  id: number;
  name: string;
  builtIn: boolean;
  taskType: TaskType;
  subTypes: TaskSubType[];
  creator: {
    id: number;
    name: string;
    accountName: string;
    roleNames: string[];
  };
  associateAll: boolean;
  relatedResources?: {
    name: string;
    resourceId: number;
    resourceType: IManagerResourceType;
  }[];
  enabled: boolean;
  createTime: number;
  approvalExpirationIntervalSeconds: number;
  waitExecutionExpirationIntervalSeconds: number;
  executionExpirationIntervalSeconds: number;
  description: string;
  riskLevelConfigs: IRiskLevelConfig[];
}

export interface IRiskLevelConfig {
  id?: number;
  subTypes: TaskSubType[];
  isContainsRiskData: boolean;
  minAffectedRows: number;
  maxAffectedRows: number;
  approvalNodes: {
    autoApprove: boolean;
    id?: number;
    roleId: number;
    roleName: string;
  }[];
  approvalRoleIdToInnerUserMap: Record<
    number,
    {
      id: number;
      name: string;
      accountName: string;
      roleNames: string[];
    }[]
  >;
}
