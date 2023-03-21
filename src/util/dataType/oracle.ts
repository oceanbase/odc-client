import { IDataTypeParamType, IDataTypes } from './interface';

/**
 * params: 参数
 */
export const dataTypes: IDataTypes = {
  integer: {
    params: [],
  },
  number: {
    params: [IDataTypeParamType.DISPLAY_WIDTH, IDataTypeParamType.SCALE],
  },
  char: {
    params: [IDataTypeParamType.SIZE],
    defaultValues: [120],
  },
  varchar2: {
    params: [IDataTypeParamType.SIZE],
    defaultValues: [120],
  },
  varchar: {
    params: [IDataTypeParamType.SIZE],
    defaultValues: [120],
  },
  nchar: {
    params: [IDataTypeParamType.SIZE],
    defaultValues: [120],
  },
  nvarchar2: {
    params: [IDataTypeParamType.SIZE],
    defaultValues: [120],
  },
  blob: {
    params: [],
  },
  clob: {
    params: [],
  },
  binary_double: {
    params: [],
  },
  binary_float: {
    params: [],
  },
  float: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
  },
  rowid: {
    params: [IDataTypeParamType.BYTE_LENGTH],
  },
  urowid: {
    params: [IDataTypeParamType.BYTE_LENGTH],
  },
  date: {
    params: [],
  },
  timestamp: {
    params: [],
    secondPrecision: true,
  },
  timestamp_with_time_zone: {
    params: [],
    secondPrecision: true,
  },
  timestamp_with_local_time_zone: {
    params: [],
    secondPrecision: true,
  },
  raw: {
    params: [IDataTypeParamType.BYTE_LENGTH],
    defaultValues: [200],
  },
  interval_year_to_month: {
    params: [],
    yearPrecision: true,
  },
  interval_day_to_second: {
    params: [],
    dayPrecision: true,
    secondPrecision: true,
  },
};
