import { SQLConfirmPage } from '@/store/helper/page/pages/create';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SQLStore } from '@/store/sql';

export interface IProps {
  sqlStore: SQLStore;
  pageStore: PageStore;
  sessionManagerStore: SessionManagerStore;
  pageKey: string;
  params: SQLConfirmPage['pageParams'];

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
