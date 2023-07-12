import { ISQLExplain } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';

export enum TAB_NAME {
  SUMMARY = 'SUMMARY',
  TRACE = 'TRACE',
}
export interface SQLExplainProps {
  explain: ISQLExplain | string;
  sql: string;
  tableHeight?: number;
  haveText?: boolean;
  session?: SessionStore;
  traceId?: string;
}
export interface SQLExplainState {
  tabName: TAB_NAME;
  onlyText: boolean;
  tableHeight: number;
  showExplainText: boolean;
  treeData: any;
  startTimestamp: number;
  endTimestamp: number;
}
