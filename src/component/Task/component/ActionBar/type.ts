import { TaskType } from '@/d.ts';

export interface IAddOperationsParams {
  taskTypeLimit?: TaskType[];
  auth: boolean;
  operations: {
    key: string;
    text: any;
    action: () => Promise<void>;
    type: string;
  }[];
}
