import { ProjectUser } from './project';

export enum MaskingAlgorithmType {
  MASK = 'MASK',
  SUBSTITUTION = 'SUBSTITUTION',
  PSEUDO = 'PSEUDO',
  HASH = 'HASH',
  ROUND = 'ROUND',
  NULL = 'NULL',
}
export enum SegmentType {
  CUSTOM = 'CUSTOM',
  PRE_1_POST_1 = 'PRE_1_POST_1',
  PRE_3_POST_2 = 'PRE_3_POST_2',
  PRE_3_POST_4 = 'PRE_3_POST_4',
  ALL = 'ALL',
  PRE_3 = 'PRE_3',
  POST_4 = 'POST_4',
}
export enum HashType {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SM3 = 'SM3',
}
export interface IMaskingAlgorithm {
  id?: number;
  name: string;
  enabled: boolean;
  builtin: boolean;
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
  organizationId: number;
  type: MaskingAlgorithmType;
  segmentType: SegmentType;
  segments: string[];
  substitution: string;
  charsets: string[];
  hashType: HashType;
  decimal: boolean;
  precision: number;
  sampleContent: string;
  maskedContent: string;
}
