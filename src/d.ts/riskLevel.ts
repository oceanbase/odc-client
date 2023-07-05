import { ITaskFlow } from '.';

export interface IRiskLevel {
  id?: number;
  name: string;
  description: string;
  level: number;
  style: EnvironmentStyle;
  approvalFlowConfigId: number;
  approvalFlowConfig: ITaskFlow;
  organizationId: number;
}
export enum EnvironmentStyle {
  GREEN = 'GREEN',
  ORANGE = 'ORANGE',
  RED = 'RED',
}
