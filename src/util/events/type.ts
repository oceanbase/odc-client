import { PLType } from '@/constant/plType';

export enum ODCEventType {
  PLPageCreated = 'PLPageCreated',
  PLPageAction = 'PLPageAction',
}

export interface IPLPageCreatedEventData {
  pageKey: string;
}

export interface IPLPageActionData {
  action: 'run' | 'compile' | 'debug';
  databaseId: number;
  plName: string;
  plType: PLType;
}
