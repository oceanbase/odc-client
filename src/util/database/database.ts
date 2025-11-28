import { IDatabase, DBType } from '@/d.ts/database';

export const isLogicalDatabase = (db: IDatabase) => {
  return db?.type === DBType.LOGICAL;
};

export const isPhysicalDatabase = (db: IDatabase) => {
  return db?.type === DBType.PHYSICAL;
};
