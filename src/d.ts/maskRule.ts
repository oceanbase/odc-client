import { MaskRuleSegmentsType } from '.';
import { ProjectUser } from './project';
export enum MaskingRuleType {
  MASK = 'MASK',
  SUBSTITUTION = 'SUBSTITUTION',
  PSEUDO = 'PSEUDO',
  HASH = 'HASH',
  ROUND = 'ROUND',
  NULL = 'NULL',
}
export enum MaskSegmentType {
  DIGIT = 'DIGIT',
  DIGIT_PERCENTAGE = 'DIGIT_PERCENTAGE',
  LEFT_OVER = 'LEFT_OVER',
  DELIMITER = 'DELIMITER',
}
export interface MaskSegment {
  mask: boolean;
  type: MaskSegmentType;
  replacedCharacters: string;
  delimiter: string;
  digitPercentage: number;
  digitNumber: number;
}
export enum MaskingRuleHashType {
  MD5 = 'MD5',
  SHA256 = 'SHA256',
  SHA512 = 'SHA512',
  SM3 = 'SM3',
}
export interface IMaskingRule {
  id?: number;
  name: string;
  type: MaskingRuleType;
  creator: ProjectUser;
  organizationId: number;
  enabled: boolean;
  builtIn: boolean;
  createTime: number;
  updateTime: number;
  testValue: string;
  segmentsType: MaskRuleSegmentsType;
  segments: MaskSegment[];
  decimal: boolean;
  precisiion: number;
  characterCollection: string[];
  hashType: MaskingRuleHashType;
}

export interface MaskingRule {
  id: number;
  name: string;
  type: MaskingRuleType;
  creator: ProjectUser;
  organizationId: number;
  enabled: boolean;
  builtIn: boolean;
  createTime: number;
  updateTime: number;
  testValue: string;
  segmentsType: MaskSegmentType;
  replacedCharacters: string;
  segments: MaskSegment[];
  decimal: boolean;
  precision: number;
  characterCollection: string[];
}
export interface MaskingRuleApplying {
  rule: MaskingRule;
  includes: string[];
  excludes: string[];
}
export interface IMaskingPolicy {
  id: number;
  name: string;
  ruleApplyings: MaskingRuleApplying[];
  creator: ProjectUser;
  createTime: number;
  updateTime: number;
}
