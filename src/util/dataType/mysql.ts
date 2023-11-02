/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IDataTypeParamType, IDataTypes } from './interface';

/**
 * params: 参数
 */
export const dataTypes: IDataTypes = {
  integer: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  int: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  numeric: {
    params: [IDataTypeParamType.DISPLAY_WIDTH, IDataTypeParamType.SCALE],
    isNumber: true,
    defaultValues: [10, 2],
  },
  decimal: {
    params: [IDataTypeParamType.DISPLAY_WIDTH, IDataTypeParamType.SCALE],
    isNumber: true,
    defaultValues: [10, 2],
  },
  bit: {
    params: [IDataTypeParamType.BIT_LENGTH],
    isBit: true,
    defaultValues: [1],
  },
  tinyint: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  smallint: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  mediumint: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  bigint: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isNumber: true,
  },
  float: {
    params: [IDataTypeParamType.DISPLAY_WIDTH, IDataTypeParamType.SCALE],
    isNumber: true,
    defaultValues: [10, 0],
  },
  double: {
    params: [IDataTypeParamType.DISPLAY_WIDTH, IDataTypeParamType.SCALE],
    isNumber: true,
    defaultValues: [10, 0],
  },
  varchar: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isChar: true,
    defaultValues: [120],
  },
  char: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isChar: true,
    defaultValues: [120],
  },
  tinytext: {
    params: [],
    isText: true,
  },
  mediumtext: {
    params: [],
    isText: true,
  },
  text: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isText: true,
  },
  longtext: {
    params: [],
    isText: true,
  },
  tinyblob: {
    params: [],
    isBlob: true,
  },
  blob: {
    params: [IDataTypeParamType.BYTE_LENGTH],
    isBlob: true,
  },
  mediumblob: {
    params: [],
    isBlob: true,
  },
  longblob: {
    params: [],
    isBlob: true,
  },
  binary: {
    params: [IDataTypeParamType.BYTE_LENGTH],
    isBinary: true,
    defaultValues: [120],
  },
  varbinary: {
    params: [IDataTypeParamType.BYTE_LENGTH],
    isBinary: true,
    defaultValues: [120],
  },
  timestamp: {
    params: [IDataTypeParamType.FSP],
    defaultValues: [0],
    isDate: true,
    canSync: true,
  },
  date: {
    params: [],
    isDate: true,
  },
  time: {
    params: [IDataTypeParamType.FSP],
    defaultValues: [0],
    isDate: true,
    canSync: true,
  },
  datetime: {
    params: [IDataTypeParamType.FSP],
    defaultValues: [0],
    isDate: true,
    canSync: true,
  },
  year: {
    params: [IDataTypeParamType.DISPLAY_WIDTH],
    isDate: true,
  },
  json: {
    params: [],
  },
  enum: {
    params: [],
    isEnum: true,
  },
  set: {
    params: [],
    isEnum: true,
  },
  bool: {
    params: [],
  },
  boolean: {
    params: [],
  },
};
