import { IResponseData } from '.';

export enum EComparisonScope {
  ALL = 'ALL',
  PART = 'PART',
}

export enum EOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DROP = 'DROP',
  NO_ACTION = 'NO_ACTION',
  SKIP = 'SKIP',
  UNSUPPORTED = 'UNSUPPORTED',
}

export interface IComparisonResult {
  dbObjectName: string;
  dbObjectType: string;
  operationType: EOperationType;
  structureComparisonId: number;
}
export interface IComparisonResultData {
  comparisonResults: {
    data: IResponseData<IComparisonResult>;
  };
  id: number;
  overSizeLimit: boolean;
  storageObjectId?: number;
  totalChangeScript?: string;
}

export interface IStructrueComparisonDetail {
  changeScript: string;
  dbObjectName: string;
  dbObjectType: string;
  id: number;
  operationType: EOperationType;
  sourceObjectDdl: string;
  targetObjectDdl: string;
}
