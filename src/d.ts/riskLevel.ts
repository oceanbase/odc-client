import { ApprovalFlowConfig } from './approvalFlow';

export interface IRiskLevel {
  id?: number;
  name: string;
  description: string;
  level: number;
  style: EnvironmentStyle;
  approvalFlowConfigId: number;
  approvalFlowConfig: ApprovalFlowConfig;
  organizationId: number;
}
export enum EnvironmentStyle {
  GREEN = 'GREEN',
  ORANGE = 'ORANGE',
  RED = 'RED',
}
