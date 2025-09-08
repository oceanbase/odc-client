export interface IAccessKey {
  status: string;
  id: string;
  accessKeyId: string;
  secretAccessKey: string;
  createTime: number;
  userId: number;
}

export enum EAccessKeyStatu {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}
