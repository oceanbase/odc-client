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

export enum IDataTypeParamType {
  /**
   * 显示位宽
   */
  DISPLAY_WIDTH,
  /**
   * 精度
   */
  SCALE,
  /**
   * bit 长度
   */
  BIT_LENGTH,
  /**
   * byte 长度
   */
  BYTE_LENGTH,
  /**
   * 小数秒的精度
   */
  FSP,
  /**
   * 255 [byte|char]，可以写单位
   */
  SIZE,
}

export type IDataTypes = Record<
  string,
  {
    params: IDataTypeParamType[];
    isNumber?: boolean;
    isChar?: boolean;
    isText?: boolean;
    isBit?: boolean;
    isBlob?: boolean;
    isBinary?: boolean;
    isDate?: boolean;
    isEnum?: boolean;
    /**
     * 是否可以同步当前时间
     */
    canSync?: boolean;
    defaultValues?: any[];
    secondPrecision?: boolean;
    yearPrecision?: boolean;
    dayPrecision?: boolean;
  }
>;
