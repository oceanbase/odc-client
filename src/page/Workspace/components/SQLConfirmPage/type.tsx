import { ITriggerFormData, PageType, SynonymType } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SQLStore } from '@/store/sql';

export interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: {
    sql: string;
    synonymType: SynonymType;
    // 上一步的表单数据
    preData: ITriggerFormData;
    type: PageType;
    // 是否显示"上一步"
    hasPre?: boolean;
    isPackageBody: boolean;
    databaseId: number;
    dbName: string;
  };

  onUnsavedChange: (pageKey: string) => void;
}

export interface IState {
  // 当前编辑器sql
  sql: string;
  // 运行结果
  log: string;
  // 是否有修改
  hasChange: boolean;
  loading: boolean;
}
