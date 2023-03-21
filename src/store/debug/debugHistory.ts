import { ILogType } from '@/d.ts';
import { generateUniqKey } from '@/util/utils';

export default class DebugHistory {
  public records: Record[] = [];
  public addHistory(meta: Record['meta'], log: string, logType: ILogType) {
    this.records = this.records.concat({
      meta,
      log,
      logType,
      time: Date.now(),
      key: generateUniqKey(),
    });
  }
  public clearHistory() {
    this.records = [];
  }
  public getStartTime() {
    return this.records?.[0]?.time;
  }
  public getEndTime() {
    return this.records[this.records.length - 1]?.time;
  }
}

interface Record {
  meta?: {
    [key: string]: any;
  };
  time: number;
  log: string;
  logType: ILogType;
  key: string;
}
