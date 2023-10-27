import { IDataType } from '@/d.ts';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';

export type TreeNode = {
  title: string;
  key: string;
  databaseId: number;
  icon: JSX.Element;
  children: TreeNode[];
};
export type SelectNodeChild = {
  title: string;
  key: string;
  type: ESensitiveColumnType;
  columnType: string;
  dataTypeUnits: IDataType[];
};
export type SelectNode = {
  databaseId: number;
  databaseKey: string;
  databaseTitle: string;
  tableKey: string;
  tableTitle: string;
  type: ESensitiveColumnType;
  children: SelectNodeChild[];
};
export type DatabaseColumn = {
  dataTypeUnits: IDataType[];
  databaseId: number;
  databaseName: string;
  table2Columns: {
    [key in string | number]: any[];
  };
  view2Columns: {
    [key in string | number]: any[];
  };
};
export interface ManualFormProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: () => void;
}
