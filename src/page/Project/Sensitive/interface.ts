import { formatMessage } from '@/util/intl';
export enum AddSensitiveColumnType {
  Manual,
  Scan,
}
export interface SelectItemProps {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FilterItemProps {
  text: string;
  value: any;
}
export interface ScanTableDataItem {
  columnName: string;
  maskingAlgorithmId: number;
  sensitiveRuleId: number;
}
export interface ScanTableData {
  header: {
    database: string;
    tableName: string;
  };
  dataSource: ScanTableDataItem[];
}

export enum DetectRuleType {
  PATH = 'PATH',
  REGEX = 'REGEX',
  GROOVY = 'GROOVY',
}

export interface CheckboxInputValue {
  readonly label: string;
  checked?: string[];
  regExp?: string;
}
export interface CheckboxInputProps {
  name?: string[];
  checkValue?: string;
  hasLabel?: boolean;
  formRef: any;
  value?: CheckboxInputValue;
  onChange?: (value: CheckboxInputValue) => void;
}

export const DetectRuleTypeMap = {
  PATH: formatMessage({ id: 'odc.Project.Sensitive.interface.Path' }), //路径
  REGEX: formatMessage({ id: 'odc.Project.Sensitive.interface.Regular' }), //正则
  GROOVY: formatMessage({ id: 'odc.Project.Sensitive.interface.Script' }), //脚本
};
