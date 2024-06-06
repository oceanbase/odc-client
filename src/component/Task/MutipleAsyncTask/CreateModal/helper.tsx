import { formatMessage } from '@/util/intl';
import type { ModalStore } from '@/store/modal';
import type { SQLStore } from '@/store/sql';
import type { TaskStore } from '@/store/task';

export interface IProps {
  sqlStore?: SQLStore;
  taskStore?: TaskStore;
  modalStore?: ModalStore;
  projectId?: number;
  theme?: string;
}
export enum ErrorStrategy {
  CONTINUE = 'CONTINUE',
  ABORT = 'ABORT',
}
export const flatArray = (array: any[]): any[] => {
  return array?.reduce?.((pre, cur) => pre?.concat(Array.isArray(cur) ? flatArray(cur) : cur), []);
};
export enum SiderTabKeys {
  SELECT_DATABASE = 'SELECT_DATABASE',
  SQL_CONTENT = 'SQL_CONTENT',
  ROLLBACK_CONTENT = 'ROLLBACK_CONTENT',
  MORE_SETTINGS = 'MORE_SETTINGS',
}
export const items = [
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.C0D9B0C7',
      defaultMessage: '数据库选择',
    }),
    key: SiderTabKeys.SELECT_DATABASE,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.AC5189F0',
      defaultMessage: 'SQL 内容',
    }),
    key: SiderTabKeys.SQL_CONTENT,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.453929F9',
      defaultMessage: '回滚内容',
    }),
    key: SiderTabKeys.ROLLBACK_CONTENT,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.0D0BC691',
      defaultMessage: '更多设置',
    }),
    key: SiderTabKeys.MORE_SETTINGS,
  },
];
