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

import compareVersions, { compare } from 'compare-versions';

export const ODC_TRACE_SUPPORT_VERSION = '4.1.0';
export const ODC_VERSION_SEP = '.';

/**
 * 对compare-versions做一定的检验与封装
 * @param firstVersion
 * @param secondVersion
 * @returns 1 | 0 | -1
 */
export function OBCompareVersions(firstVersion: string, secondVersion: string): 1 | 0 | -1 {
  const firstVersionSlice = firstVersion?.split(ODC_VERSION_SEP) || [];
  const secondVersionSlice = secondVersion?.split(ODC_VERSION_SEP) || [];
  if (firstVersionSlice?.length < secondVersionSlice?.length) {
    throw Error(`fisrtVersion's version is short than secondVersion, please check firstVersion.`);
  } else if (firstVersionSlice?.length >= secondVersionSlice?.length) {
    return compareVersions(
      firstVersionSlice?.slice(0, secondVersionSlice?.length)?.join(''),
      secondVersionSlice?.join(''),
    );
  } else {
    return compareVersions(firstVersion, secondVersion);
  }
}
/**
 * 对compare-versions的compare方法做一定的检验与封装
 * @param firstVersion
 * @param secondVersion
 * @param operator
 * @returns boolean
 */
export function OBCompare(
  firstVersion: string,
  secondVersion: string,
  operator: compareVersions.CompareOperator,
): boolean {
  const firstVersionSlice = firstVersion?.split(ODC_VERSION_SEP) || [];
  const secondVersionSlice = secondVersion?.split(ODC_VERSION_SEP) || [];
  if (firstVersionSlice?.length < secondVersionSlice?.length) {
    throw Error(`fisrtVersion's version is short than secondVersion, please check firstVersion.`);
  } else if (firstVersionSlice?.length >= secondVersionSlice?.length) {
    return compare(
      firstVersionSlice?.slice(0, secondVersionSlice?.length)?.join(''),
      secondVersionSlice?.join(''),
      operator,
    );
  } else {
    return compare(firstVersion, secondVersion, operator);
  }
}
