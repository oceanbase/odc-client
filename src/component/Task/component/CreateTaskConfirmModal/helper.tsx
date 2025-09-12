import { IDatabase } from '@/d.ts/database';

export const getDefaultName = (database: IDatabase) => {
  return `[${database?.environment?.name}]${database?.name}_${+new Date()}`;
};

export const getInitScheduleName = (scheduleName: string, type: 'RETRY' | 'EDIT') => {
  if (scheduleName) {
    if (type === 'RETRY') {
      return `[克隆]${scheduleName}`;
    }
    return scheduleName;
  }
  return undefined;
};
