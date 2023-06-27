
export interface ApprovalFlowConfig {
  id?: number;
  name: string;
  description: string;
  approvalExpirationIntervalSeconds: number;
  executionExpirationIntervalSeconds: number;
  waitExecutionExpirationIntervalSeconds: number;
  refrencedCount: number;
  nodes: ApprovalNodeConfig[];
  organizationId: number;
  builtIn: boolean;
}
export interface ApprovalNodeConfig {
  id?: number;
  resourceRoleId: number;
  resourceRoleName: string;
  externalApprovalId: number;
  externalApprovalName: string;
  autoApproval: boolean;
  sequenceNumber: number;
}
