import { IDatabase } from '@/d.ts/database';

export const getDefaultName = (database: IDatabase) => {
  return `[${database?.environment?.name}]${database?.name}_${+new Date()}`;
};
